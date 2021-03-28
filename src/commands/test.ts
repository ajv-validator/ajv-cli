import type {Command} from "./types"
import type {ParsedArgs} from "minimist"
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
      spec: {enum: ["draft7", "draft2019", "draft2020", "jtd"]},
    },
    ajvOptions: true,
  },
}

export default cmd

function execute(argv: ParsedArgs): boolean {
  const ajv = getAjv(argv)
  const validate = compile(ajv, argv.s)
  const shouldBeValid = !!argv.valid && argv.valid !== "false"
  return getFiles(argv.d)
    .map(testDataFile)
    .every((x) => x)

  function testDataFile(file: string): boolean {
    const data = openFile(file, `data file ${file}`)
    const validData = validate(data)
    let errors
    if (!validData) errors = logJSON(argv.errors, validate.errors, ajv)

    if (validData === shouldBeValid) {
      console.log(`${file} passed test`)
      if (errors) console.log(errors)
      return true
    }
    console.error(`${file} failed test`)
    if (errors) console.error(errors)
    return false
  }
}
