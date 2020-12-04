import type {AnySchemaObject} from "ajv"
import type {ParsedArgs} from "minimist"

export interface Command {
  execute: (argv: ParsedArgs) => boolean | void
  schema: AnySchemaObject
}
