"use strict"

const util = require("./util")
const getAjv = require("./ajv")
const ajvPack = require("ajv-pack")
const fs = require("fs")

module.exports = {
  execute: execute,
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

function execute(argv) {
  const ajv = getAjv(argv)
  let allValid = true

  const schemaFiles = util.getFiles(argv.s)
  if (argv.o && schemaFiles.length > 1) {
    console.error("multiple schemas cannot be compiled to a file")
    return false
  }
  schemaFiles.forEach(compileSchema)

  return allValid

  function compileSchema(file) {
    const schema = util.openFile(file, "schema " + file)
    let validate
    try {
      validate = ajv.compile(schema)
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
