import type {Command, CmdName} from "./types"
import type {ParsedArgs} from "minimist"
import usage from "./usage"

const cmd: Command = {
  execute,
  schema: {
    type: "object",
    properties: {
      _: {maxItems: 2},
    },
  },
}

export default cmd

const commands: {[Name in CmdName]: () => void} = {
  help: mainHelp,
  compile: helpCompile,
  validate: helpValidate,
  migrate: helpMigrate,
  test: helpTest,
}

function execute(argv: ParsedArgs): boolean {
  const command = argv._[1]
  if (!command) {
    mainHelp()
    return true
  }

  if (command in commands) {
    commands[command as CmdName]()
    return true
  }

  console.error("Unknown command", command)
  usage()
  return false
}

function mainHelp(): void {
  _helpValidate()
  _helpCompile()
  _helpMigrate()
  _helpTest()
  schemaSpecOption()
  console.log(`
More information:
        ajv help validate
        ajv help compile
        ajv help migrate
        ajv help test`)
}

function schemaSpecOption(): void {
  console.log(`
options:
    --spec=            JSON schema specification to use
            draft7     JSON Schema draft-07 (default)
            draft2019  JSON Schema draft-2019-09`)
}

function helpValidate(): void {
  _helpValidate()
  console.log(`
parameters
    -s JSON schema to validate against (required, only one schema allowed)
    -d data file(s) to be validated (required)
    -r referenced schema(s)
    -m meta schema(s)
    -c custom keywords/formats definitions

    -d, -r, -m, -c can be globs and can be used multiple times
    glob should be enclosed in double quotes
    -c module(s) should export a function that accepts Ajv instance as parameter
    (file path should start with ".", otherwise used as require package)
    .json extension can be omitted (but should be used in globs)`)
  schemaSpecOption()
  console.log(`
    --errors=          error reporting format ("js" by default)
    --changes=         log changes in data after validation ("no" by default)
             js        JavaScript object
             json      JSON format
             line      JSON single line
             text      text message (only for --errors option)
             no        don't log errors`)
  helpAjvOptions()
}

function _helpValidate(): void {
  console.log(`
Validate data file(s) against schema
    ajv [validate] -s schema[.json] -d data[.json]
    ajv [validate] -s schema[.json] -d "data*.json"`)
}

function helpCompile(): void {
  _helpCompile()
  console.log(`
parameters
    -s JSON schema to validate against (required)
    -r referenced schema(s)
    -m meta schema(s)
    -c custom keywords/formats definitions
    -o output file for compiled validation function

    -s, -r, -m, -c can be globs and can be used multiple times
    With option -o multiple schemas will be exported using $ids as export names
    Glob should be enclosed in double quotes
    -c module(s) should export a function that accepts Ajv instance as parameter
    (file path should start with ".", otherwise used as require package)
    .json extension can be omitted (but should be used in globs)`)
  schemaSpecOption()
  helpAjvOptions()
}

function _helpCompile(): void {
  console.log(`
Compile schema(s)
    ajv compile -s schema[.json]
    ajv compile -s "schema*.json"`)
}

function helpMigrate(): void {
  _helpMigrate()
  console.log(`
parameters
    -s JSON schema(s) to migrate to draft-07 or draft-2019-09 (required)
    -o output file for migrated schema (only allowed for a single schema)

    -s can be glob and can be used multiple times
    If option -o is used only one schema can be migrated
    glob should be enclosed in double quotes
    .json extension can be omitted (but should be used in globs)`)
  schemaSpecOption()
  console.log(`
    --indent=<N>            indentation in migrated schema JSON file, 4 by default
    --validate-schema=false skip schema validation`)
}

function _helpMigrate(): void {
  console.log(`
Migrate schema(s) to draft-07 or draft-2019-09
    ajv migrate -s schema[.json] -o migrated_schema.json
    ajv migrate -s "schema*.json"`)
}

function helpTest(): void {
  _helpTest()
  console.log(`
parameters
    -s JSON schema to validate against (required, only one schema allowed)
    -d data file(s) to be validated (required)
    -r referenced schema(s)
    -m meta schema(s)
    -c custom keywords/formats definitions
    --valid/--invalid data file(s) must be valid/invalid for this command to succeed

    -d, -r, -m, -c can be globs and can be used multiple times
    glob should be enclosed in double quotes
    -c module(s) should export a function that accepts Ajv instance as parameter
    (file path should start with ".", otherwise used as require package)
    .json extension can be omitted (but should be used in globs)
    --valid=false can be used instead of --invalid`)
  schemaSpecOption()
  console.log(`
    --errors=          error reporting
             js        JavaScript object (default)
             json      JSON format
             line      JSON single line
             text      text message`)
  helpAjvOptions()
}

function _helpTest(): void {
  console.log(`
Test data validation result
    ajv test -s schema[.json] -d data[.json] --valid
    ajv test -s schema[.json] -d data[.json] --invalid
    ajv test -s schema[.json] -d "data*.json" --valid`)
}

function helpAjvOptions(): void {
  console.log(`
Ajv options (see https://github.com/epoberezkin/ajv#options):
    --strict=false     disable strict mode

    --strict-tuples=   unconstrained tuples
             true      throw exception
             false     allow
             log       log warning

    --strict-types=    union or unspecified types
             true      throw exception
             false     allow
             log       log warning

    --allow-matching-properties  allow "properties" matching patterns in "patternProperties"

    --allow-union-types  allow union type keyword

    --validate-formats=false  disable format validation

    --data             use $data references

    --all-errors       collect all errors

    --verbose          include schema and data in errors

    --comment          log schema "$comment"s

    --inline-refs=     referenced schemas compilation mode
             true      inline $ref code when possible
             false     always compile $ref as a function call
             <number>  inline $ref code up to this number of keywords

    --remove-additional=  remove additional properties
             all       remove all additional properties
             true      remove if additionalProperties is false
             failing   also remove if fails validation of schema in additionalProperties

    --use-defaults     replace missing properties/items with the values from default keyword

    --coerce-types     change type of data to match type keyword

    --multiple-of-precision=N  pass integer number

    --messages=false   do not include text messages in errors
    
    --loop-required=   max size of "required to compile to expression (rather than to loop)

    --loop-enum=       max size of "enum" to compile to expression (rather than to loop)
    
    --own-properties   only validate own properties (not relevant for JSON, but can have effect for JavaScript objects)
    
    --code.es5         generate ES5 code

    --code.lines       generate multi-line code

    --code.optimize=   code optimization
             false     disable
             <number>  number of optimization passes (1 pass by default)`)
}
