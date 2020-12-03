import type {Command} from "../types"
import {getFiles, openFile} from "./util"
import getAjv from "./ajv"
import ajvPack = require("ajv-pack")
import fs = require("fs")

const cmd: Command = {
  execute,
  schema: {
    type: "object",
    required: ["s"],
    properties: {
      s: {$ref: "#/definitions/stringOrArray"},
      r: {$ref: "#/definitions/stringOrArray"},
      m: {$ref: "#/definitions/stringOrArray"},
      c: {$ref: "#/definitions/stringOrArray"},
      o: {type: "string"},
    },
  },
}

export default cmd

function execute(argv): boolean {
  const ajv = getAjv(argv)
  let allValid = true

  const schemaFiles = getFiles(argv.s)
  if (argv.o && schemaFiles.length > 1) {
    console.error("multiple schemas cannot be compiled to a file")
    return false
  }
  schemaFiles.forEach(compileSchema)

  return allValid

  function compileSchema(file: string): void {
    const sch = openFile(file, "schema " + file)
    let validate
    try {
      validate = ajv.compile(sch)
      /* istanbul ignore else */
      if (typeof validate == "function") {
        console.log("schema", file, "is valid")
        if (argv.o) {
          try {
            const moduleCode = ajvPack(ajv, validate)
            try {
              fs.writeFileSync(argv.o, moduleCode)
            } catch (e) {
              console.error("error saving file:", e)
              allValid = false
            }
          } catch (e) {
            console.error("error preparing module:", e)
            allValid = false
          }
        }
      } else {
        allValid = false
        console.error("schema", file, "failed to compile to a function")
        console.error(validate)
      }
    } catch (err) {
      allValid = false
      console.error("schema", file, "is invalid")
      console.error("error:", err.message)
    }
  }
}
