"use strict"

const util = require("./util")
const fs = require("fs")
const migrate = require("json-schema-migrate")
const jsonPatch = require("fast-json-patch")

module.exports = {
  execute: execute,
  schema: {
    type: "object",
    required: ["s"],
    properties: {
      s: {$ref: "#/definitions/stringOrArray"},
      o: {type: "string"},
      v5: {type: "boolean"},
      indent: {type: "integer", minimum: 1},
      "validate-schema": {type: "boolean"},
    },
    _ajvOptions: false,
  },
}

function execute(argv) {
  let allValid = true
  const opts = {
    v5: argv.v5,
    validateSchema: argv["validate-schema"],
  }

  const schemaFiles = util.getFiles(argv.s)
  if (argv.o && schemaFiles.length > 1) {
    console.error("multiple schemas cannot be migrated to a named output file")
    return false
  }
  schemaFiles.forEach(migrateSchema)

  return allValid

  function migrateSchema(file) {
    const schema = util.openFile(file, "schema " + file)
    const migratedSchema = JSON.parse(JSON.stringify(schema))

    try {
      migrate.draft6(migratedSchema, opts)
      const patch = jsonPatch.compare(schema, migratedSchema)
      if (patch.length > 0) {
        if (argv.o) {
          saveSchema(argv.o, migratedSchema)
        } else {
          const backupFile = file + ".bak"
          fs.writeFileSync(backupFile, fs.readFileSync(file, "utf8"))
          saveSchema(file, migratedSchema)
        }
      } else {
        console.log("no changes in", file)
      }
    } catch (err) {
      allValid = false
      console.error("schema", file, "is invalid")
      console.error("error:", err.message)
    }
  }

  function saveSchema(file, schema) {
    fs.writeFileSync(file, JSON.stringify(schema, null, argv.indent || 4))
    console.log("saved migrated schema to", file)
  }
}
