import type {Command} from "./types"
import type {AnyValidateFunction} from "ajv/dist/core"
import type {ParsedArgs} from "minimist"
import {getFiles, openFile} from "./util"
import getAjv from "./ajv"
import standaloneCode from "ajv/dist/standalone"
import * as fs from "fs"

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
      o: {anyOf: [{type: "string", format: "notGlob"}, {type: "boolean"}]},
      spec: {enum: ["draft7", "draft2019", "draft2020", "jtd"]},
    },
    ajvOptions: true,
  },
}

export default cmd

function execute(argv: ParsedArgs): boolean {
  const ajv = getAjv(argv)
  const schemaFiles = getFiles(argv.s)
  if ("o" in argv && schemaFiles.length > 1) return compileMultiExportModule(schemaFiles)
  return schemaFiles.map(compileSchemaAndSave).every((x) => x)

  function compileMultiExportModule(files: string[]): boolean {
    const validators = files.map(compileSchema)
    if (validators.every((v) => v)) {
      return saveStandaloneCode(getRefs(validators as AnyValidateFunction[], files))
    }
    console.error("module not saved")
    return false
  }

  function compileSchemaAndSave(file: string): boolean {
    const validate = compileSchema(file)
    if (validate) return "o" in argv ? saveStandaloneCode(validate) : true
    return false
  }

  function compileSchema(file: string): AnyValidateFunction | undefined {
    const sch = openFile(file, `schema ${file}`)
    try {
      const id = sch?.$id
      ajv.addSchema(sch, id ? undefined : file)
      const validate = ajv.getSchema(id || file)
      if (argv.o !== true) console.log(`schema ${file} is valid`)
      return validate
    } catch (err) {
      console.error(`schema ${file} is invalid`)
      console.error(`error: ${(err as Error).message}`)
      return undefined
    }
  }

  function getRefs(validators: AnyValidateFunction[], files: string[]): {[K in string]?: string} {
    const refs: {[K in string]?: string} = {}
    validators.forEach((v, i) => {
      const ref = typeof v.schema == "object" ? v.schema.$id || files[i] : files[i]
      refs[ref] = ref
    })
    return refs
  }

  function saveStandaloneCode(refsOrFunc: AnyValidateFunction | {[K in string]?: string}): boolean {
    try {
      const moduleCode = standaloneCode(ajv, refsOrFunc)
      try {
        if (argv.o === true) console.log(moduleCode)
        else fs.writeFileSync(argv.o, moduleCode)
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
