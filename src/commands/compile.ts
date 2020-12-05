import type {Command} from "./types"
import type {AnyValidateFunction} from "ajv/dist/core"
import type {ParsedArgs} from "minimist"
import {getFiles, openFile} from "./util"
import getAjv from "./ajv"
import standaloneCode from "ajv/dist/standalone"
import fs = require("fs")

const cmd: Command = {
  execute,
  schema: {
    type: "object",
    required: ["s"],
    properties: {
      s: {$ref: "#/$defs/stringOrArray"},
      r: {$ref: "#/$defs/stringOrArray"},
      m: {$ref: "#/$defs/stringOrArray"},
      c: {$ref: "#/$defs/stringOrArray"},
      o: {type: "string"},
      spec: {enum: ["draft7", "draft2019"]},
    },
    ajvOptions: true,
  },
}

export default cmd

function and(xs: string[], f: (x: string) => boolean): boolean {
  return xs.reduce((res: boolean, x: string) => res && f(x), true)
}

function execute(argv: ParsedArgs): boolean {
  const ajv = getAjv(argv)
  const schemaFiles = getFiles(argv.s)
  if (argv.o && schemaFiles.length > 1) return compileMultiExportModule(schemaFiles)
  return and(schemaFiles, compileSchemaAndSave)

  function compileMultiExportModule(files: string[]): boolean {
    const allValid = and(files, (file) => !!compileSchema(file))
    if (allValid) return saveStandaloneCode()
    console.error("module not generated")
    return false
  }

  function compileSchemaAndSave(file: string): boolean {
    const validate = compileSchema(file)
    if (validate) return argv.o ? saveStandaloneCode(validate) : true
    return false
  }

  function compileSchema(file: string): AnyValidateFunction | undefined {
    const sch = openFile(file, `schema ${file}`)
    try {
      ajv.addSchema(sch, sch.$id ? undefined : file )
      const validate = ajv.getSchema(sch.$id)
      console.log(`schema ${file} is valid`)
      return validate
    } catch (err) {
      console.error(`schema ${file} is invalid`)
      console.error(`error: ${err.message}`)
      return undefined
    }
  }

  function saveStandaloneCode(validate?: AnyValidateFunction): boolean {
    try {
      const moduleCode = standaloneCode(ajv, validate)
      try {
        fs.writeFileSync(argv.o, moduleCode)
        return true
      } catch (e) {
        console.error("error saving file:", e)
        return false
      }
    } catch (e) {
      console.error("error preparing module:", e)
      return false
    }
  }
}
