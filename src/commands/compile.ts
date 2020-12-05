import type {Command} from "./types"
import type {AnyValidateFunction} from "ajv/dist/core"
import type {ParsedArgs} from "minimist"
import {getFiles, openFile, all} from "./util"
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
      o: {type: "string", format: "notGlob"},
      spec: {enum: ["draft7", "draft2019"]},
    },
    ajvOptions: true,
  },
}

export default cmd

function execute(argv: ParsedArgs): boolean {
  const ajv = getAjv(argv)
  const schemaFiles = getFiles(argv.s)
  if (argv.o && schemaFiles.length > 1) return compileMultiExportModule(schemaFiles)
  return all(schemaFiles, compileSchemaAndSave)

  function compileMultiExportModule(files: string[]): boolean {
    const allValid = all(files, (file) => !!compileSchema(file))
    if (allValid) return saveStandaloneCode()
    console.error("module not saved")
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
      const id = sch?.$id
      ajv.addSchema(sch, id ? undefined : file )
      const validate = ajv.getSchema(id)
      console.log(`schema ${file} is valid`)
      return validate
    } catch (err) {
      console.error(`schema ${file} is invalid`)
      console.error(`error: ${(err as Error).message}`)
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
