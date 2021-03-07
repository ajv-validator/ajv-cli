import type Ajv from "ajv"
import * as glob from "glob"
import * as path from "path"
import * as fs from "fs"
import * as yaml from "js-yaml"
import * as JSON5 from "json5"
import {AnyValidateFunction} from "ajv/dist/core"

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
    case "jsonc":
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

export function compile(ajv: Ajv, schemaFile: string): AnyValidateFunction {
  const schema = openFile(schemaFile, "schema")
  try {
    return ajv.compile(schema)
  } catch (err) {
    console.error(`schema ${schemaFile} is invalid`)
    console.error(`error: ${err.message}`)
    process.exit(1)
  }
}
