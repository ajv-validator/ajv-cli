"use strict"

const cli = require("./cli")
const assert = require("assert")
const fs = require("fs")
const path = require("path")

describe("migrate", function () {
  this.timeout(10000)

  it("should migrate schema to draft-06", (done) => {
    try {
      deleteSchema("migrated_schema.json")
    } catch (e) {}

    cli(
      "migrate -s test/migrate/schema.json -o test/migrate/migrated_schema.json",
      (error, stdout, stderr) => {
        try {
          assert.strictEqual(error, null)
          assertMigrated(stdout, 1)
          assert.equal(stderr, "")
          const migratedSchema = readSchema("migrated_schema.json")
          const expectedMigratedSchema = require("./migrate/expected_migrated_schema.json")
          assert.deepStrictEqual(migratedSchema, expectedMigratedSchema)
        } finally {
          deleteSchema("migrated_schema.json")
        }
        done()
      }
    )
  })

  it("should migrate schema to draft-06 to the same file and create backup", (done) => {
    const backup = fs.readFileSync(path.join(__dirname, "migrate", "schema.json"), "utf8")

    cli("migrate -s test/migrate/schema.json", (error, stdout, stderr) => {
      try {
        assert.strictEqual(error, null)
        assertMigrated(stdout, 1)
        assert.equal(stderr, "")
        const backupSchema = readSchema("schema.json.bak")
        assert.deepStrictEqual(backupSchema, JSON.parse(backup))

        const migratedSchema = readSchema("schema.json")
        const expectedMigratedSchema = require("./migrate/expected_migrated_schema.json")
        assert.deepStrictEqual(migratedSchema, expectedMigratedSchema)
      } finally {
        fs.writeFileSync(path.join(__dirname, "migrate", "schema.json"), backup)
        deleteSchema("schema.json.bak")
      }
      done()
    })
  })

  it("should not save schema id schema is draft-06 compatible", (done) => {
    cli(
      "migrate -s test/migrate/schema_no_changes.json -o test/migrate/migrated_schema.json",
      (error, stdout, stderr) => {
        assert.strictEqual(error, null)
        assert.equal(stderr, "")
        const lines = stdout.split("\n")
        assert.equal(lines.length, 2)
        assert(/no\schanges/.test(lines[0]))
        let err
        try {
          readSchema("migrated_schema.json")
        } catch (e) {
          err = e
        }
        assert(err instanceof Error)
        done()
      }
    )
  })

  it("should fail on invalid schema", (done) => {
    cli("migrate -s test/migrate/schema_invalid.json", (error, stdout, stderr) => {
      assert(error instanceof Error)
      assert.equal(stdout, "")
      assertError(stderr)
      done()
    })
  })

  it("should fail if multiple schemas passed with -o option", (done) => {
    cli(
      'migrate -s "test/migrate/schema*.json"  -o test/migrate/migrated_schema.json',
      (error, stdout, stderr) => {
        assert(error instanceof Error)
        assert.equal(stdout, "")
        assert(/multiple\sschemas/.test(stderr))
        done()
      }
    )
  })
})

function assertMigrated(stdout, count) {
  const lines = stdout.split("\n")
  assert.equal(lines.length, count + 1)
  for (let i = 0; i < count; i++) assert(/saved\smigrated\sschema/.test(lines[i]))
}

function assertError(stderr) {
  const lines = stderr.split("\n")
  assert.equal(lines.length, 3)
  assert(/schema/.test(lines[0]))
  assert(/\sinvalid/.test(lines[0]))
  assert(/error/.test(lines[1]))
  return lines
}

function readSchema(file) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "migrate", file), "utf8"))
}

function deleteSchema(file) {
  fs.unlinkSync(path.join(__dirname, "migrate", file))
}
