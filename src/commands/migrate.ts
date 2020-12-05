import type {Command} from "./types"
import type {AnySchemaObject} from "ajv"
import type {ParsedArgs} from "minimist"
import {getFiles, getSpec, openFile} from "./util"
import getAjv from "./ajv"
import fs = require("fs")
import * as migrate from "json-schema-migrate"
import jsonPatch = require("fast-json-patch")

const cmd: Command = {
  execute,
  schema: {
    type: "object",
    required: ["s"],
    properties: {
      s: {$ref: "#/$defs/stringOrArray"},
      o: {type: "string"},
      indent: {type: "integer", minimum: 1},
      "validate-schema": {type: "boolean"},
      spec: {enum: ["draft7", "draft2019"]},
    },
  },
}

export default cmd

function execute(argv: ParsedArgs): boolean {
  let allValid = true
  const schemaFiles = getFiles(argv.s)
  if (argv.o && schemaFiles.length > 1) {
    console.error("multiple schemas cannot be migrated to a named output file")
    return false
  }
  schemaFiles.forEach(migrateSchema)

  return allValid

  function migrateSchema(file: string): void {
    const sch = openFile(file, "schema " + file)
    const migratedSchema: AnySchemaObject = JSON.parse(JSON.stringify(sch))
    migrate[getSpec(argv)](migratedSchema)
    if (argv["validate-schema"] !== false) {
      const ajv = getAjv(argv)
      const valid = ajv.validateSchema(migratedSchema) as boolean
      if (!valid) {
        allValid = false
        console.error("schema", file, "is invalid after migration")
        console.error("error:", migrate.getAjv().errorsText(ajv.errors))
        return
      }
    }
    const patch = jsonPatch.compare(sch, migratedSchema)
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
  }

  function saveSchema(file: string, sch: AnySchemaObject): void {
    fs.writeFileSync(file, JSON.stringify(sch, null, argv.indent || 2))
    console.log("saved migrated schema to", file)
  }
}
