import type {SchemaObject} from "ajv"
import type {ParsedArgs} from "minimist"

export interface Command {
  execute: (argv: ParsedArgs) => boolean
  schema: SchemaObject
}

export type SchemaSpec = "draft7" | "draft2019"
