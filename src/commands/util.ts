import type Ajv from "ajv"
import glob = require("glob")
import path = require("path")
import fs = require("fs")
import yaml = require("js-yaml")
import JSON5 = require("json5")
import fetch, {Response} from "node-fetch"
import {AnyValidateFunction, SchemaObject} from "ajv/dist/core"

export async function loadSchema(uri: string): Promise<SchemaObject> {
  return fetch(uri).then((response: Response) => {
    if (!response.ok) {
      throw new Error(`Loading Error ${response.status} for [ ${uri} ]`)
    } else {
      return response.json()
    }
  })
}

export function getFiles(args: string | string[]): string[] {
  let files: string[] = []
  if (Array.isArray(args)) args.forEach(_getFiles)
  else _getFiles(args)
  return files

  function _getFiles(fileOrPattern: string): void {
    if (glob.hasMagic(fileOrPattern)) {
      const dataFiles = glob.sync(fileOrPattern, {cwd: process.cwd()})
      files = files.concat(dataFiles)
    } else {
      files.push(fileOrPattern)
    }
  }
}

function getFormatFromFileName(filename: string): string {
  return path.extname(filename).substr(1).toLowerCase()
}

function decodeFile(contents: string, format: string): any {
  switch (format) {
    case "json":
      return JSON.parse(contents)
    case "json5":
      return JSON5.parse(contents)
    case "yml":
    case "yaml":
      return yaml.safeLoad(contents)
    default:
      throw new Error(`unsupported file format ${format}`)
  }
}

export function openFile(filename: string, suffix: string): any {
  let json = null
  const file = path.resolve(process.cwd(), filename)
  try {
    try {
      const format = getFormatFromFileName(filename)
      json = decodeFile(fs.readFileSync(file).toString(), format)
    } catch (e) {
      json = require(file)
    }
  } catch (err) {
    const msg: string = err.message
    console.error(`error:  ${msg.replace(" module", " " + suffix)}`)
    process.exit(2)
  }
  return json
}

export function logJSON(mode: string, data: any, ajv?: Ajv): string {
  switch (mode) {
    case "json":
      data = JSON.stringify(data, null, "  ")
      break
    case "line":
      data = JSON.stringify(data)
      break
    case "no":
      data = ""
      break
    case "text":
      if (ajv) data = ajv.errorsText(data)
  }
  return data
}

export async function compile(ajv: Ajv, schemaFile: string): Promise<AnyValidateFunction> {
  const schema = openFile(schemaFile, "schema")
  try {
    return await ajv.compileAsync(schema)
  } catch (error) {
    console.error(`schema ${schemaFile} is invalid`)
    console.error(`error: ${error.message}`)
    throw error
  }
}
