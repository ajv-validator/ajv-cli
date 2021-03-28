import type {ExecException} from "child_process"
import cli from "./cli"
import assert = require("assert")
import fs = require("fs")

describe("compile", function () {
  this.timeout(10000)

  it("should compile valid schema", (done) => {
    cli("compile -s test/schema", (error, stdout, stderr) => {
      assert.strictEqual(error, null)
      assertValid(stdout, 1)
      assert.strictEqual(stderr, "")
      done()
    })
  })

  it("should compile multiple schemas", (done) => {
    cli(
      "compile -s test/schema -s test/meta/schema -m test/meta/meta_schema --strict=false",
      (error, stdout, stderr) => {
        assert.strictEqual(error, null)
        assertValid(stdout, 2)
        assert.strictEqual(stderr, "")
        done()
      }
    )
  })

  it("should compile schema to output file", (done) => {
    cli("compile -s test/schema -o test/validate_schema1.js", (error, stdout, stderr) => {
      const validate = require("./validate_schema1.js")
      fs.unlinkSync("test/validate_schema1.js")

      assert.strictEqual(error, null)
      assertValid(stdout, 1)
      assert.strictEqual(stderr, "")

      const validData = require("./valid_data.json")
      const invalidData = require("./invalid_data.json")
      assert.strictEqual(validate(validData), true)
      assert.strictEqual(validate(invalidData), false)
      done()
    })
  })

  it("should compile multiple schemas to output file", (done) => {
    cli(
      "compile -s test/schema -s test/schema_with_ref -o test/validate_schema2.js",
      (error, stdout, stderr) => {
        const validators = require("./validate_schema2.js")
        fs.unlinkSync("test/validate_schema2.js")

        assert.strictEqual(error, null)
        assertValid(stdout, 2)
        assert.strictEqual(stderr, "")

        const validData = require("./valid_data.json")
        const invalidData = require("./invalid_data.json")
        assert.strictEqual(validators["schema.json"](validData), true)
        assert.strictEqual(validators["schema.json"](invalidData), false)
        assert.strictEqual(validators["schema_with_ref.json"](validData), true)
        assert.strictEqual(validators["schema_with_ref.json"](invalidData), false)
        done()
      }
    )
  })

  it("should compile valid schema with a custom meta-schema", (done) => {
    cli(
      "compile -s test/meta/schema -m test/meta/meta_schema --strict=false",
      (error, stdout, stderr) => {
        assert.strictEqual(error, null)
        assertValid(stdout, 1)
        assert.strictEqual(stderr, "")
        done()
      }
    )
  })

  it("should compile schema with custom keyword", (done) => {
    cli(
      "compile -s test/custom/schema -c ./test/custom/typeof.js -o test/custom/validate_schema.js",
      (error, stdout, stderr) => {
        assertCompiledCustom(error, stdout, stderr)
        done()
      }
    )
  })

  it("should compile schema with custom keyword from npm package", (done) => {
    cli(
      "compile -s test/custom/schema -c ajv-keywords/dist/keywords/typeof -o test/custom/validate_schema.js",
      (error, stdout, stderr) => {
        assertCompiledCustom(error, stdout, stderr)
        done()
      }
    )
  })

  it("should compile schema with custom keyword written in typescript", (done) => {
    cli(
      "compile -s test/custom/schema -c ./test/custom/typeof_ts.ts -o test/custom/validate_schema.js",
      (error, stdout, stderr) => {
        assertCompiledCustom(error, stdout, stderr)
        done()
      }
    )
  })

  it("should fail to compile invalid schema with a custom meta-schema", (done) => {
    cli("compile -s test/meta/invalid_schema -m test/meta/meta_schema", (error, stdout, stderr) => {
      assert(error instanceof Error)
      assert.strictEqual(stdout, "")
      const lines = assertError(stderr)
      assert(/my_keyword\smust\sbe\sboolean/.test(lines[1]))
      done()
    })
  })

  it("should fail to save compiled schemas when path does not exist", (done) => {
    cli("compile -s test/schema -o no_folder/validate_schema.js", (error, stdout, stderr) => {
      assert(error instanceof Error)
      assertValid(stdout, 1)
      const lines = stderr.split("\n")
      assert(lines.length > 1)
      assert(/error\ssaving\sfile/.test(lines[0]))
      done()
    })
  })

  it("should fail to compile if referenced schema is invalid", (done) => {
    cli("compile -s test/schema -r test/meta/invalid_schema2", (error, stdout, stderr) => {
      assert(error instanceof Error)
      assert.strictEqual(stdout, "")
      const lines = assertError(stderr)
      assert(/schema\sis\sinvalid/.test(lines[1]))
      done()
    })
  })

  it("should fail to compile if custom package does not export function", (done) => {
    cli(
      "compile -s test/custom/schema -c ./test/custom/invalid_custom.js",
      (error, stdout, stderr) => {
        assert(error instanceof Error)
        assert.strictEqual(stdout, "")
        const lines = stderr.split("\n")
        assert(/module.*is\sinvalid/.test(lines[0]))
        assert(/not\sa\sfunction/.test(lines[1]))
        done()
      }
    )
  })

  it("should fail if output file is glob", (done) => {
    cli("compile -s test/schema -o test/*.js", (error, stdout, stderr) => {
      assert(error instanceof Error)
      assert(stderr.includes("only one file is allowed"))
      assert(stderr.includes("usage"))
      assert.strictEqual(stdout, "")
      done()
    })
  })

  it("should fail if too many parameters", (done) => {
    cli("compile file -s test/schema", (error, stdout, stderr) => {
      assert(error instanceof Error)
      assert(stderr.includes("too many arguments"))
      assert(stderr.includes("usage"))
      assert.strictEqual(stdout, "")
      done()
    })
  })

  it("should compile JTD schema", (done) => {
    cli("compile -s test/jtd/schema --spec=jtd", (error, stdout, stderr) => {
      assert.strictEqual(error, null)
      assertValid(stdout, 1)
      assert.strictEqual(stderr, "")
      done()
    })
  })
})

function assertValid(stdout: string, count: number): void {
  const lines = stdout.split("\n")
  assert.strictEqual(lines.length, count + 1)
  for (let i = 0; i < count; i++) assert(/\svalid/.test(lines[i]))
}

function assertError(stderr: string): string[] {
  const lines = stderr.split("\n")
  assert.strictEqual(lines.length, 3)
  assert(lines[0].includes("schema"))
  assert(/\sinvalid/.test(lines[0]))
  assert(lines[1].includes("error"))
  return lines
}

function assertCompiledCustom(error: ExecException | null, stdout: string, stderr: string): void {
  assert.strictEqual(error, null)
  assertValid(stdout, 1)
  assert.strictEqual(stderr, "")

  const validate = require("./custom/validate_schema.js")
  const validData = require("./custom/valid_data.json")
  const invalidData = require("./custom/invalid_data.json")
  assert.strictEqual(validate(validData), true)
  assert.strictEqual(validate(invalidData), false)

  fs.unlinkSync("test/custom/validate_schema.js")
}
