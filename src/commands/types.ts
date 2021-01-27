import type {SchemaObject} from "ajv"
import type {ParsedArgs} from "minimist"

export type CmdName = "compile" | "help" | "validate" | "migrate" | "test"

export interface Command {
  execute: (argv: ParsedArgs) => Promise<boolean>
  schema: SchemaObject
}

export type SchemaSpec = "draft7" | "draft2019"
