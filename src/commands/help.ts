import type {Command} from "../types"
import usage from "./usage"

const cmd: Command = {
  execute,
  schema: {
    type: "object",
    properties: {
      _: {maxItems: 2},
    },
    _ajvOptions: false,
  },
}

export default cmd

const commands = {
  validate: helpValidate,
  compile: helpCompile,
  migrate: helpMigrate,
  test: helpTest,
}

function execute(argv): boolean | void {
  const command = argv._[1]
  if (!command || command === "help") {
    mainHelp()
    return true
  }

  const cmdHelp = commands[command]

  if (cmdHelp) {
    cmdHelp()
    return true
  }

  console.error("Unknown command", command)
  usage()
}

function mainHelp(): void {
  _helpValidate()
  _helpCompile()
  _helpMigrate()
  _helpTest()
  console.log(`
More information:
        ajv help validate
        ajv help compile
        ajv help migrate
        ajv help test`)
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
    .json extension can be omitted (but should be used in globs)

options:
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
    If option -o is used only one schema can be compiled
    glob should be enclosed in double quotes
    -c module(s) should export a function that accepts Ajv instance as parameter
    (file path should start with ".", otherwise used as require package)
    .json extension can be omitted (but should be used in globs)`)
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
    -s JSON schema(s) to migrate to draft-06 (required)
    -o output file for migrated schema (only allowed for a single schema)

    -s can be glob and can be used multiple times
    If option -o is used only one schema can be migrated
    glob should be enclosed in double quotes
    .json extension can be omitted (but should be used in globs)

options:
    --v5                    migrate schema as v5 if $schema is not specified
    --indent=<N>            indentation in migrated schema JSON file, 4 by default
    --validate-schema=false skip schema validation`)
}

function _helpMigrate(): void {
  console.log(`
Migrate schema(s) to draft-06
    ajv migrate -s schema[.json] -o migrated_schema.json
    ajv migrate -s "schema*.json`)
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
    --valid=false can be used instead of --invalid

options:
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
    --data             use $data references

    --all-errors       collect all errors

    --unknown-formats= handling of unknown formats
             true      throw exception during schema compilation (default)
             <string>  allowed unknown format name, multiple names can be used

    --json-pointers    report data paths as JSON pointers

    --unique-items=false  do not validate uniqueItems keyword

    --unicode=false    count unicode pairs as 2 characters

    --format=          format validation mode
             fast      using regex (default)
             full      using functions

    --schema-id=       (by default both IDs will be used)
             $id       use $id
             id        use id

    --extend-refs=     validation of other keywords when $ref is present in the schema
             ignore    ignore other keywords (default)
             fail      throw exception (recommended)
             true      validate all keywords

    --missing-refs=    handling missing referenced schemas
             true      fail schema compilation (default)
             ignore    log error and pass validation
             fail      log error and fail validation if ref is used

    --remove-additional=  remove additional properties
             all       remove all additional properties
             true      remove if additionalProperties is false
             failing   also remove if fails validation of schema in additionalProperties

    --use-defaults     replace missing properties/items with the values from default keyword

    --coerce-types     change type of data to match type keyword

    --multiple-of-precision=N  pass integer number

    --error-data-path= data path in errors of required, additionalProperties and dependencies
             object    point to object (default)
             property  point to property

    --messages=false   do not include text messages in errors`)
}
