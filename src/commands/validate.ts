import type {Command} from "./types"
import {compile, getFiles, openFile, logJSON} from "./util"
import getAjv from "./ajv"
import jsonPatch = require("fast-json-patch")

const cmd: Command = {
  execute,
  schema: {
    type: "object",
    required: ["s", "d"],
    properties: {
      s: {
        type: "string",
        format: "notGlob",
      },
      d: {$ref: "#/$defs/stringOrArray"},
      r: {$ref: "#/$defs/stringOrArray"},
      m: {$ref: "#/$defs/stringOrArray"},
      c: {$ref: "#/$defs/stringOrArray"},
      errors: {enum: ["json", "line", "text", "js", "no"]},
      changes: {enum: [true, "json", "line", "js"]},
    },
    ajvOptions: true,
  },
}

export default cmd

function execute(argv): boolean {
  const ajv = getAjv(argv)
  const validate = compile(ajv, argv.s)
  let allValid = true

  const dataFiles = getFiles(argv.d)
  dataFiles.forEach(validateDataFile)

  return allValid

  function validateDataFile(file: string): void {
    const data = openFile(file, "data file " + file)
    let original
    if (argv.changes) original = JSON.parse(JSON.stringify(data))
    const validData = validate(data)

    if (validData) {
      console.log(file, "valid")
      if (argv.changes) {
        const patch = jsonPatch.compare(original, data)
        if (patch.length === 0) {
          console.log("no changes")
        } else {
          console.log("changes:")
          console.log(logJSON(argv.changes, patch))
        }
      }
    } else {
      allValid = false
      console.error(file, "invalid")
      console.error(logJSON(argv.errors, validate.errors, ajv))
    }
  }
}
