import cli from "./cli"
import assert = require("assert")
import fs = require("fs")
import path = require("path")
import {AnySchemaObject} from "ajv"

describe("migrate", function () {
  this.timeout(10000)

  it("should migrate schema to draft-07", (done) => {
    testMigrate(
      "migrate -s test/migrate/schema.json -o test/migrate/migrated_schema.json --spec=draft7",
      "./migrate/expected_migrated_schema.json",
      done
    )
  })

  it("should migrate schema to draft-07 by default", (done) => {
    testMigrate(
      "migrate -s test/migrate/schema.json -o test/migrate/migrated_schema.json",
      "./migrate/expected_migrated_schema.json",
      done
    )
  })

  it("should migrate schema to draft-2019-09", (done) => {
    testMigrate(
      "migrate -s test/migrate/schema.json -o test/migrate/migrated_schema.json --spec=draft2019",
      "./migrate/expected_migrated_schema_2019.json",
      done
    )
  })

  function testMigrate(cmd: string, expectedFile: string, done: () => void): void {
    try {
      deleteSchema("migrated_schema.json")
    } catch (e) {}

    cli(cmd, (error, stdout, stderr) => {
      try {
        assert.strictEqual(error, null)
        assertMigrated(stdout, 1)
        assert.strictEqual(stderr, "")
        const migratedSchema = readSchema("migrated_schema.json")
        const expectedMigratedSchema = require(expectedFile)
        assert.deepStrictEqual(migratedSchema, expectedMigratedSchema)
      } finally {
        deleteSchema("migrated_schema.json")
      }
      done()
    })
  }

  it("should migrate schema to draft-07 to the same file and create backup", (done) => {
    const backup = fs.readFileSync(path.join(__dirname, "migrate", "schema.json"), "utf8")

    cli("migrate -s test/migrate/schema.json", (error, stdout, stderr) => {
      try {
        assert.strictEqual(error, null)
        assertMigrated(stdout, 1)
        assert.strictEqual(stderr, "")
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

  it("should not save schema if schema is draft-07 compatible", (done) => {
    cli(
      "migrate -s test/migrate/schema_no_changes.json -o test/migrate/migrated_schema.json",
      (error, stdout, stderr) => {
        assert.strictEqual(error, null)
        assert.strictEqual(stderr, "")
        const lines = stdout.split("\n")
        assert.strictEqual(lines.length, 2)
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
      assert.strictEqual(stdout, "")
      assertError(stderr)
      done()
    })
  })

  it("should fail if multiple schemas passed with -o option", (done) => {
    cli(
      'migrate -s "test/migrate/schema*.json"  -o test/migrate/migrated_schema.json',
      (error, stdout, stderr) => {
        assert(error instanceof Error)
        assert.strictEqual(stdout, "")
        assert(/multiple\sschemas/.test(stderr))
        done()
      }
    )
  })
})

function assertMigrated(stdout: string, count: number): void {
  const lines = stdout.split("\n")
  assert.strictEqual(lines.length, count + 1)
  for (let i = 0; i < count; i++) assert(/saved\smigrated\sschema/.test(lines[i]))
}

function assertError(stderr: string): string[] {
  const lines = stderr.split("\n")
  assert.strictEqual(lines.length, 3)
  assert(lines[0].includes("schema"))
  assert(/\sinvalid/.test(lines[0]))
  assert(lines[1].includes("error"))
  return lines
}

function readSchema(file: string): AnySchemaObject {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "migrate", file), "utf8"))
}

function deleteSchema(file: string): void {
  fs.unlinkSync(path.join(__dirname, "migrate", file))
}
