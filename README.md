# ajv-cli

Command line interface for [ajv](https://github.com/epoberezkin/ajv), one of the [fastest json schema validators](https://github.com/ebdrup/json-schema-benchmark).
Supports [JSON](http://json.org/), [JSON5](http://json5.org/), and [YAML](http://yaml.org/).

[![build](https://github.com/ajv-validator/ajv-cli/workflows/build/badge.svg)](https://github.com/ajv-validator/ajv-cli/actions?query=workflow%3Abuild)
[![npm](https://img.shields.io/npm/v/ajv-cli.svg)](https://www.npmjs.com/package/ajv-cli)
[![coverage](https://coveralls.io/repos/github/ajv-validator/ajv-cli/badge.svg?branch=master)](https://coveralls.io/github/ajv-validator/ajv-cli?branch=master)
[![gitter](https://img.shields.io/gitter/room/ajv-validator/ajv.svg)](https://gitter.im/ajv-validator/ajv)

## Contents

- [Installation](#installation)
- [JSON schema version](#json-schema-version)
- Commands
  - [Help](#help-command)
  - [Validate data](#validate-data)
  - [Compile schemas](#compile-schemas)
  - [Migrate schemas](#migrate-schemas)
  - [Test validation result](#test-validation-result)
- [Ajv options](#ajv-options)
- [Version History, License](#version_history)

## Installation

```sh
npm install -g ajv-cli
```

## JSON schema version

Parameter `--spec` can be used with all commands (other than help) to define which JSON schema language is used:

- `--spec=draft7` (default) - support JSON Schema draft-07 (uses `import Ajv from "ajv"`)
- `--spec=draft2019` - support JSON Schema draft-2019-09 (uses `import Ajv from "ajv/dist/2019"`)
- `--spec=jtd` - support JSON Type Definition (uses `import Ajv from "ajv/dist/jtd"`)

## Commands

### Help command

```sh
ajv help
ajv help validate
ajv help compile
ajv help migrate
ajv help test
```

### Validate data

This command validates data files against JSON-schema

```sh
ajv validate -s test/schema.json -d test/valid_data.json
ajv -s test/schema.json -d test/valid_data.json
```

You can omit `validate` command name and `.json` from the [input file names](https://nodejs.org/api/modules.html#modules_file_modules).

#### Parameters

##### `-s` - file name of JSON-schema

Only one schema can be passed in this parameter

##### `-d` - JSON data

Multiple data files can be passed, as in `-r` parameter:

```sh
ajv -s test/schema.json -d "test/valid*.json"
```

If some file is invalid exit code will be 1.

##### `-r` - referenced schemas

The schema in `-s` parameter can reference any of these schemas with `$ref` keyword.

Multiple schemas can be passed both by using this parameter multiple times and with [glob patterns](https://github.com/isaacs/node-glob#glob-primer). Glob pattern should be quoted and extensions cannot be omitted.

##### `-m` - meta-schemas

Schemas can use any of these schemas as a meta-schema (that is the schema used in `$schema` keyword - it is used to validate the schema itself).

Multiple meta-schemas can be passed, as in `-r` parameter.

##### `-c` - custom keywords/formats definitions

You can pass module(s) that define custom keywords/formats. The modules should export a function that accepts Ajv instance as a parameter. The file name should start with ".", it will be resolved relative to the current folder. The package name can also be passed - it will be used in require as is.
These modules can be written in TypeScript if you have `ts-node` installed.

For example, you can use `-c ajv-keywords` to add all keywords from [ajv-keywords](https://github.com/epoberezkin/ajv-keywords) package or `-c ajv-keywords/keywords/typeof` to add only typeof keyword.

#### Options

- `--errors=`: error reporting format. Possible values:

  - `js` (default): JavaScript object
  - `json`: JSON with indentation and line-breaks
  - `line`: JSON without indentation/line-breaks (for easy parsing)
  - `text`: human readable error messages with data paths

- `--changes=`: detect changes in data after validation.<br>
  Data can be modified with [Ajv options](#ajv-options) `--remove-additional`, `--use-defaults` and `--coerce-types`).<br>
  The changes are reported in JSON-patch format ([RFC6902](https://tools.ietf.org/html/rfc6902)).<br>
  Possible values are `js` (default), `json` and `line` (see `--errors` option).

### Compile schemas

This command validates and compiles schema without validating any data.

It can be used to check that the schema is valid and to create a standalone module exporting validation function (using [ajv-pack](https://github.com/epoberezkin/ajv-pack)).

```sh
ajv compile -s schema

# compile to module file
ajv compile -s schema -o validate.js

## compile to stdout, to allow code formatting (js-beautify has to be installed separately)
ajv compile -s schema -o | js-beautify > validate.js
```

#### Parameters

##### `-s` - file name(s) of JSON-schema(s)

Multiple schemas can be passed both by using this parameter multiple times and with [glob patterns](https://github.com/isaacs/node-glob#glob-primer).

```sh
ajv compile -s "test/schema*.json"
```

##### `-o` - output file for compiled validation function module

If multiple schemas are compiled with this option the module will have multiple exports named as schema $id's or as file names, otherwise the module will export validation function as default export.

```sh
ajv compile -s "schema.json" -o "validate_schema.js"
```

`-o` without parameter should be used to output code to stdout to pass it to some code formatter.

This command also supports parameters `-r`, `-m` and `-c` as in [validate](#validate-data) command.

### Migrate schemas

This command validates and migrates schema from JSON Schema draft-04 to JSON Schema draft-07 or draft-2019-09 using [json-schema-migrate](https://github.com/epoberezkin/json-schema-migrate) package.

The [version of JSON Schema](#json-schema-version) is determined by `--spec` parameter (only `"draft7"` or `"draft2019"`).

```sh
ajv migrate -s schema

# compile to specific file name
ajv migrate -s schema -o migrated_schema.json
```

#### Parameters

##### `-s` - file name(s) of JSON-schema(s)

Multiple schemas can be passed both by using this parameter multiple times and with [glob patterns](https://github.com/isaacs/node-glob#glob-primer).

```sh
ajv migrate -s "test/schema*.json"
```

If parameter `-o` is not specified the migrated schema is written to the same file and the original file is preserved with `.bak` extension.

If migration doesn't change anything in the schema file no changes in files are made.

##### `-o` - output file for migrated schema

Only a single schema can be migrated with this option.

```sh
ajv compile -s "schema.json" -o migrated_schema.json
```

#### Options

- `v5`: migrate schema as v5 if $schema is not specified
- `--indent=`: indentation in migrated schema JSON file, 4 by default
- `--validate-schema=false`: skip schema validation

### Test validation result

This command asserts that the result of the validation is as expected.

```sh
ajv test -s test/schema.json -d test/valid_data.json --valid
ajv test -s test/schema.json -d test/invalid_data.json --invalid
```

If the option `--valid` (`--invalid`) is used for the `test` to pass (exit code 0) the data file(s) should be valid (invalid).

This command supports the same options and parameters as [validate](#validate-data) with the exception of `--changes`.

## Ajv options

You can pass the following [Ajv options](https://github.com/ajv-validator/ajv/blob/master/docs/api.md#options):

| Option                        | Description                                                                                                                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Strict mode                   |
| `--strict=false`              | disable [strict mode](https://github.com/ajv-validator/ajv/blob/master/docs/strict-mode.md)                                                                                                            |
| `--strict-tuples=`            | throw on (`true`) or ignore (`false`) [strict tuples](https://github.com/ajv-validator/ajv/blob/master/docs/strict-mode.md#prohibit-unconstrained-tuples) restrictions (the default is to log)         |
| `--strict-types=`             | throw on (`true`) or ignore (`false`) [strict types](https://github.com/ajv-validator/ajv/blob/master/docs/strict-mode.md#strict-types) restrictions (the default is to log)                           |
| `--allow-matching-properties` | allow `properties` [matching patterns](https://github.com/ajv-validator/ajv/blob/master/docs/strict-mode.md#prohibit-overlap-between-properties-and-patternproperties-keywords) in `patternProperties` |
| `--allow-union-types`         | allow [union types](https://github.com/ajv-validator/ajv/blob/master/docs/strict-mode.md#prohibit-union-types)                                                                                         |
| `--validate-formats=false`    | disable format validation                                                                                                                                                                              |
| Validation and reporting      |
| `--data`                      | use [$data references](https://github.com/ajv-validator/ajv/blob/master/docs/validation.md#data-reference)                                                                                             |
| `--all-errors`                | collect all validation errors                                                                                                                                                                          |
| `--verbose`                   | include schema and data in errors                                                                                                                                                                      |
| `--comment`                   | log schema `$comment`s                                                                                                                                                                                 |
| `--inline-refs=`              | referenced schemas compilation mode (true/false/\<number\>)                                                                                                                                            |
| Modify validated data         |
| `--remove-additional`         | remove additional properties (true/all/failing)                                                                                                                                                        |
| `--use-defaults`              | replace missing properties/items with the values from default keyword                                                                                                                                  |
| `--coerce-types`              | change type of data to match type keyword                                                                                                                                                              |
| Advanced                      |
| `--multiple-of-precision`     | precision of multipleOf, pass integer number                                                                                                                                                           |
| `--messages=false`            | do not include text messages in errors                                                                                                                                                                 |
| `--loop-required=`            | max size of `required` to compile to expression (rather than to loop)                                                                                                                                  |
| `--loop-enum=`                | max size of `enum` to compile to expression (rather than to loop)                                                                                                                                      |
| `--own-properties`            | only validate own properties (not relevant for JSON, but can have effect for JavaScript objects)                                                                                                       |
| Code generation               |
| `--code-es5`                  | generate ES5 code                                                                                                                                                                                      |
| `--code-lines`                | generate multi-line code                                                                                                                                                                               |
| `--code-optimize=`            | disable optimization (`false`) or number of optimization passes (1 pass by default)                                                                                                                    |
| `--code-formats=`             | code to require formats object (only needed if you generate standalone code and do not use [ajv-formats](https://github.com/ajv-validator/ajv-formats))                                                |

Options can be passed using either dash-case or camelCase.

See [Ajv Options](https://github.com/ajv-validator/ajv/blob/master/docs/api.md#options) for more information.

## Version History

See https://github.com/jessedc/ajv-cli/releases

## Licence

[MIT](./LICENSE)
