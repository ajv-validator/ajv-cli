"use strict"

const Ajv = require("ajv")
const options = require("./options")
const util = require("./util")
const path = require("path")

module.exports = function (argv) {
  const opts = options.get(argv)
  opts.schemaId = "auto"
  if (argv.o) opts.sourceCode = true
  const ajv = new Ajv(opts)
  let invalid
  ajv.addMetaSchema(require("ajv/lib/refs/json-schema-draft-04.json"))
  ajv.addMetaSchema(require("ajv/lib/refs/json-schema-draft-06.json"))
  addSchemas(argv.m, "addMetaSchema", "meta-schema")
  addSchemas(argv.r, "addSchema", "schema")
  customFormatsKeywords(argv.c)
  if (invalid) process.exit(1)
  return ajv

  function addSchemas(args, method, fileType) {
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

  function customFormatsKeywords(args) {
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
