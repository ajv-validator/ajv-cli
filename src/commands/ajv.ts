import Ajv from "ajv"
import {getOptions} from "./options"
import util = require("./util")
import path = require("path")
import draft6metaSchema = require("ajv/lib/refs/json-schema-draft-06.json")

export default function (argv): Ajv {
  const opts = getOptions(argv)
  if (argv.o) opts.code.source = true
  const ajv = new Ajv(opts)
  let invalid: boolean | undefined
  ajv.addMetaSchema(draft6metaSchema)
  addSchemas(argv.m, "addMetaSchema", "meta-schema")
  addSchemas(argv.r, "addSchema", "schema")
  customFormatsKeywords(argv.c)
  if (invalid) process.exit(1)
  return ajv

  function addSchemas(args, method: string, fileType: string): void {
    if (!args) return
    const files = util.getFiles(args)
    files.forEach((file) => {
      const schema = util.openFile(file, fileType)
      try {
        ajv[method](schema)
      } catch (err) {
        console.error(fileType, file, "is invalid")
        console.error("error:", err.message)
        invalid = true
      }
    })
  }

  function customFormatsKeywords(args): void {
    if (!args) return
    const files = util.getFiles(args)
    files.forEach((file) => {
      if (file[0] === ".") file = path.resolve(process.cwd(), file)
      try {
        require(file)(ajv)
      } catch (err) {
        console.error("module", file, "is invalid; it should export function")
        console.error("error:", err.message)
        invalid = true
      }
    })
  }
}
