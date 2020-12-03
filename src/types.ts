type Arguments = any

type SchemaObject = Record<string, any>

export interface Command {
  execute: (argv: Arguments) => boolean | void
  usage?: () => void
  schema: SchemaObject
}
