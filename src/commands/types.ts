import type {SchemaObject} from "ajv"
import type {ParsedArgs} from "minimist"

export type CmdName = "compile" | "help" | "validate" | "migrate" | "test"

export interface Command {
  execute: (argv: ParsedArgs) => boolean
  schema: SchemaObject
}

export type JSONSchemaDraft = "draft7" | "draft2019" | "draft2020"

export type SchemaSpec = JSONSchemaDraft | "jtd"
