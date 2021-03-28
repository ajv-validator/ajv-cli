import type {Command, JSONSchemaDraft} from "./types"
import type {AnySchemaObject} from "ajv"
import type {ParsedArgs} from "minimist"
import {getFiles, openFile} from "./util"
import getAjv from "./ajv"
import * as fs from "fs"
import * as migrate from "json-schema-migrate"
import * as jsonPatch from "fast-json-patch"

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
      spec: {enum: ["draft7", "draft2019", "draft2020"]},
    },
  },
}

export default cmd

function execute(argv: ParsedArgs): boolean {
  const schemaFiles = getFiles(argv.s)
  if (argv.o && schemaFiles.length > 1) {
    console.error("multiple schemas cannot be migrated to a named output file")
    return false
  }
  return schemaFiles.map(migrateSchema).every((x) => x)

  function migrateSchema(file: string): boolean {
    const sch = openFile(file, `schema ${file}`)
    const migratedSchema: AnySchemaObject = JSON.parse(JSON.stringify(sch))
    const spec = (argv.spec || "draft7") as JSONSchemaDraft
    migrate[spec](migratedSchema)
    if (argv["validate-schema"] !== false) {
      const ajv = getAjv(argv)
      const valid = ajv.validateSchema(migratedSchema) as boolean
      if (!valid) {
        console.error(`schema ${file} is invalid after migration`)
        console.error("error:", migrate.getAjv().errorsText(ajv.errors))
        return false
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
      console.log(`no changes in ${file}`)
    }
    return true
  }

  function saveSchema(file: string, sch: AnySchemaObject): void {
    fs.writeFileSync(file, JSON.stringify(sch, null, argv.indent || 2))
    console.log(`saved migrated schema to ${file}`)
  }
}
