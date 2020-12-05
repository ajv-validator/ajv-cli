import type {Command} from "./types"
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
            const moduleCode = standaloneCode(ajv, validate)
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
