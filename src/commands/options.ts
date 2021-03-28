import Ajv, {CodeOptions, Options} from "ajv/dist/2019"
import type {SchemaObject, SchemaMap, ErrorObject} from "ajv/dist/types"
import type {ParsedArgs} from "minimist"
import * as glob from "glob"

const boolOrNat = {type: ["boolean", "integer"], minimum: 0}
const CODE = "code-"
const ajvOptions: SchemaMap = {
  strict: boolOrString(["log"]),
  strictSchema: boolOrString(["log"]),
  strictNumbers: boolOrString(["log"]),
  strictTypes: boolOrString(["log"]),
  strictTuples: boolOrString(["log"]),
  strictRequired: boolOrString(["log"]),
  allowMatchingProperties: {type: "boolean"},
  allowUnionTypes: {type: "boolean"},
  validateFormats: {type: "boolean"},
  data: {type: "boolean"},
  allErrors: {type: "boolean"},
  verbose: {type: "boolean"},
  comment: {type: "boolean"},
  inlineRefs: boolOrNat,
  loopRequired: {type: "integer"},
  loopEnum: {type: "integer"},
  ownProperties: {type: "boolean"},
  multipleOfPrecision: boolOrNat,
  messages: {type: "boolean"},
  [`${CODE}es5`]: {type: "boolean"},
  [`${CODE}lines`]: {type: "boolean"},
  [`${CODE}optimize`]: boolOrNat,
  [`${CODE}formats`]: {type: "string"},
  // options to modify validated data:
  removeAdditional: boolOrString(["all", "failing"]),
  useDefaults: boolOrString(["empty"]),
  coerceTypes: boolOrString(["array"]),
}

const ajv = new Ajv({
  allErrors: true,
  coerceTypes: "array",
  strictTypes: false,
  formats: {notGlob: (s) => !glob.hasMagic(s)},
  keywords: ["ajvOptions"],
})

function boolOrString(vs: string[]): SchemaObject {
  return {anyOf: [{type: "boolean"}, {enum: vs}]}
}

const DEFS = {
  stringOrArray: {type: ["string", "array"], items: {type: "string"}},
}

export function checkOptions(schema: SchemaObject, argv: ParsedArgs): string | null {
  schema.$defs = DEFS
  if ("ajvOptions" in schema) {
    schema.properties = {...schema.properties, ...ajvOptions, ...withDashCase(ajvOptions)}
  }
  schema.properties._ ||= {maxItems: 1}
  schema.additionalProperties = false

  const valid = ajv.validate(schema, argv)
  if (valid) return null
  let errors = ""
  ajv.errors?.forEach((err: ErrorObject) => {
    errors += "error: "
    switch (err.keyword) {
      case "required":
        errors += "parameter " + parameter(err.params.missingProperty) + " is required"
        break
      case "additionalProperties":
        errors += "parameter " + parameter(err.params.additionalProperty) + " is unknown"
        break
      case "maxItems":
        errors += "invalid syntax (too many arguments)"
        break
      case "format":
        if (err.params.format === "notGlob") {
          errors += "only one file is allowed in parameter " + parameter(err.instancePath.slice(1))
          break
        }
        errors += `parameter ${parameter(err.instancePath.slice(1))} ${err.message}`
        break
      default:
        errors += `parameter ${parameter(err.instancePath.slice(1))} ${err.message}`
    }
    errors += "\n"
  })

  return errors
}

function parameter(str: string): string {
  return (str.length === 1 ? "-" : "--") + str
}

export function getOptions(argv: ParsedArgs): Options & {code: CodeOptions} {
  const options: {[K in string]: any} = {code: {}}
  for (const opt in ajvOptions) {
    const value = argv[toDashCase(opt)] ?? argv[opt]
    if (value === undefined) continue
    if (opt.startsWith(CODE)) {
      options.code[opt.slice(CODE.length)] = value
    } else {
      options[opt === "data" ? "$data" : opt] = value
    }
  }
  return options as Options & {code: CodeOptions}
}

function toDashCase(str: string): string {
  return str.replace(/[A-Z]/g, (s) => "-" + s.toLowerCase())
}

function withDashCase(sm: SchemaMap): SchemaMap {
  const res: SchemaMap = {}
  for (const p in sm) {
    res[toDashCase(p)] = sm[p]
  }
  return res
}
