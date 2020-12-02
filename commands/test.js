"use strict"

const util = require("./util")
const getAjv = require("./ajv")

module.exports = {
  execute: execute,
  schema: {
    type: "object",
    required: ["s", "d"],
    oneOf: [{required: ["valid"]}, {required: ["invalid"]}],
    properties: {
      s: {
        type: "string",
        format: "notGlob",
      },
      d: {$ref: "#/definitions/stringOrArray"},
      r: {$ref: "#/definitions/stringOrArray"},
      m: {$ref: "#/definitions/stringOrArray"},
      c: {$ref: "#/definitions/stringOrArray"},
      valid: {type: "boolean"},
      invalid: {type: "boolean", enum: [true]},
      errors: {enum: ["json", "line", "text", "js", "no"]},
    },
  },
}

function execute(argv) {
  const ajv = getAjv(argv)
  const validate = util.compile(ajv, argv.s)
  const shouldBeValid = !!argv.valid && argv.valid !== "false"
  let allPassed = true

  const dataFiles = util.getFiles(argv.d)
  dataFiles.forEach(testDataFile)

  return allPassed

  function testDataFile(file) {
    const data = util.openFile(file, "data file " + file)
    const validData = validate(data)
    let errors
    if (!validData) errors = util.logJSON(argv.errors, validate.errors, ajv)

    if (validData === shouldBeValid) {
      console.log(file, "passed test")
      if (errors) console.log(errors)
    } else {
      allPassed = false
      console.error(file, "failed test")
      if (errors) console.error(errors)
    }
  }
}
