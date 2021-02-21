export default function usage(): void {
  console.error(`
usage:
    validate:  ajv [validate] -s schema[.json] -d data[.json]
    compile:   ajv compile -s schema[.json]
    migrate:   ajv migrate -s schema[.json] -o migrated_schema.json
    test:      ajv test -s schema[.json] -d data[.json] --[in]valid

    help:      ajv help
               ajv help <command>`)
}
