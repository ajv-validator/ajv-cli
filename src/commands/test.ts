import type {Command} from "./types"
import {compile, getFiles, openFile, logJSON} from "./util"
import getAjv from "./ajv"

const cmd: Command = {
  execute,
  schema: {
    type: "object",
    required: ["s", "d"],
    oneOf: [{required: ["valid"]}, {required: ["invalid"]}],
    properties: {
      s: {
        type: "string",
        format: "notGlob",
      },
      d: {$ref: "#/$defs/stringOrArray"},
      r: {$ref: "#/$defs/stringOrArray"},
      m: {$ref: "#/$defs/stringOrArray"},
      c: {$ref: "#/$defs/stringOrArray"},
      valid: {type: "boolean"},
      invalid: {type: "boolean", enum: [true]},
      errors: {enum: ["json", "line", "text", "js", "no"]},
      spec: {enum: ["draft7", "draft2019"]},
    },
    ajvOptions: true,
  },
}

export default cmd

function execute(argv): boolean {
  const ajv = getAjv(argv)
  const validate = compile(ajv, argv.s)
  const shouldBeValid = !!argv.valid && argv.valid !== "false"
  let allPassed = true

  const dataFiles = getFiles(argv.d)
  dataFiles.forEach(testDataFile)

  return allPassed

  function testDataFile(file: string): void {
    const data = openFile(file, "data file " + file)
    const validData = validate(data)
    let errors
    if (!validData) errors = logJSON(argv.errors, validate.errors, ajv)

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
