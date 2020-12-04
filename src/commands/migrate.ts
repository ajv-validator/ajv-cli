import type {Command} from "./types"
import type {AnySchemaObject} from "ajv"
import {getFiles, openFile} from "./util"
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
      spec: {enum: ["draft7", "draft2019"]},
      indent: {type: "integer", minimum: 1},
      "validate-schema": {type: "boolean"},
    },
  },
}

export default cmd

function execute(argv): boolean {
  let allValid = true
  // const opts = {
  //   v5: argv.v5,
  //   validateSchema: argv["validate-schema"],
  // }

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

    const {valid, errors} = migrate.draft7(migratedSchema)
    if (!valid && argv["validate-schema"] !== false) {
      allValid = false
      console.error("schema", file, "is invalid")
      console.error("error:", migrate.getAjv().errorsText(errors))
      return
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
