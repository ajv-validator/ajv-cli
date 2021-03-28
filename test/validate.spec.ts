import cli from "./cli"
import assert = require("assert")
import type {DefinedError} from "ajv"

describe("validate", function () {
  this.timeout(10000)

  describe("single file validation", () => {
    it("should validate valid data", (done) => {
      cli("-s test/schema -d test/valid_data", (error, stdout, stderr) => {
        assert.strictEqual(error, null)
        assertValid(stdout, 1)
        assert.strictEqual(stderr, "")
        done()
      })
    })

    it('should validate valid data with the "yml" extension', (done) => {
      cli("-s test/schema -d test/valid_data.yml", (error, stdout, stderr) => {
        assert.strictEqual(error, null)
        assertValid(stdout, 1)
        assert.strictEqual(stderr, "")
        done()
      })
    })

    it('should validate valid data with the "yaml" extension', (done) => {
      cli("-s test/schema -d test/valid_data.yaml", (error, stdout, stderr) => {
        assert.strictEqual(error, null)
        assertValid(stdout, 1)
        assert.strictEqual(stderr, "")
        done()
      })
    })

    it('should validate valid data with the "json5" extension', (done) => {
      cli("-s test/schema -d test/valid_data.json5", (error, stdout, stderr) => {
        assert.strictEqual(error, null)
        assertValid(stdout, 1)
        assert.strictEqual(stderr, "")
        done()
      })
    })

    it('should validate valid data with the "jsonc" extension', (done) => {
      cli("-s test/schema -d test/valid_data.jsonc", (error, stdout, stderr) => {
        assert.strictEqual(error, null)
        assertValid(stdout, 1)
        assert.strictEqual(stderr, "")
        done()
      })
    })

    it("falls back to require on unsupported formats", (done) => {
      cli(
        "-s test/schema.json -d test/invalid_format.cson --errors=line",
        (error, stdout, stderr) => {
          assert(error instanceof Error)
          assert.strictEqual(stdout, "")
          assert.ok(/Invalid or unexpected token/i.exec(stderr))
          done()
        }
      )
    })

    it("should validate invalid data", (done) => {
      cli(
        "-s test/schema.json -d test/invalid_data.json --errors=line",
        (error, stdout, stderr) => {
          assert(error instanceof Error)
          assert.strictEqual(stdout, "")
          assertRequiredErrors(stderr)
          done()
        }
      )
    })

    it("should print usage if syntax is invalid", (done) => {
      cli("-d test/valid_data", (error, stdout, stderr) => {
        assert(error instanceof Error)
        assert.strictEqual(stdout, "")
        assert(stderr.includes("usage"))
        assert(stderr.includes("parameter"))
        assert(stderr.includes("required"))
        done()
      })
    })

    it("should validate valid data with JTD schema", (done) => {
      cli("validate -s test/jtd/schema -d test/jtd/data --spec=jtd", (error, stdout, stderr) => {
        assert.strictEqual(error, null)
        assertValid(stdout, 1)
        assert.strictEqual(stderr, "")
        done()
      })
    })

    it("should validate invalid data with JTD schema", (done) => {
      cli(
        "validate -s test/jtd/schema -d test/jtd/invalid_data --spec=jtd --errors=line",
        (error, stdout, stderr) => {
          assert(error instanceof Error)
          assert.strictEqual(stdout, "")
          assertErrors(stderr, 1).forEach((errors) => assert.strictEqual(errors.length, 1))
          done()
        }
      )
    })
  })

  describe("multiple file validation", () => {
    describe("with glob", () => {
      it("should exit without error if all files are valid", (done) => {
        cli('-s test/schema -d "test/valid*.json"', (error, stdout, stderr) => {
          assert.strictEqual(error, null)
          assertValid(stdout, 2)
          assert.strictEqual(stderr, "")
          done()
        })
      })

      it("should exit with error if some files are invalid", (done) => {
        cli(
          '-s test/schema -d "test/{valid,invalid}*.json" --errors=line',
          (error, stdout, stderr) => {
            assert(error instanceof Error)
            assertValid(stdout, 2)
            assertRequiredErrors(stderr, "#", 2)
            done()
          }
        )
      })
    })

    describe("with multiple files or patterns", () => {
      it("should exit without error if all files are valid", (done) => {
        cli(
          "-s test/schema -d test/valid_data.json -d test/valid_data2.json",
          (error, stdout, stderr) => {
            assert.strictEqual(error, null)
            assertValid(stdout, 2)
            assert.strictEqual(stderr, "")
            done()
          }
        )
      })

      it("should exit with error if some files are invalid", (done) => {
        cli(
          "-s test/schema -d test/valid_data.json -d test/valid_data2.json -d test/invalid_data.json --errors=line",
          (error, stdout, stderr) => {
            assert(error instanceof Error)
            assertValid(stdout, 2)
            assertRequiredErrors(stderr)
            done()
          }
        )
      })

      it("should exit with error if some files are invalid (multiple patterns)", (done) => {
        cli(
          '-s test/schema -d "test/valid*.json" -d "test/invalid*.json" --errors=line',
          (error, stdout, stderr) => {
            assert(error instanceof Error)
            assertValid(stdout, 2)
            assertRequiredErrors(stderr, "#", 2)
            done()
          }
        )
      })
    })
  })

  describe("validate schema with $ref", () => {
    it("should resolve reference and validate", (done) => {
      cli("-s test/schema_with_ref -r test/schema -d test/valid_data", (error, stdout, stderr) => {
        assert.strictEqual(error, null)
        assertValid(stdout, 1)
        assert.strictEqual(stderr, "")
        done()
      })
    })

    it("should resolve reference and validate invalid data", (done) => {
      cli(
        "-s test/schema_with_ref -r test/schema -d test/invalid_data --errors=line",
        (error, stdout, stderr) => {
          assert(error instanceof Error)
          assert.strictEqual(stdout, "")
          assertRequiredErrors(stderr, "schema.json")
          done()
        }
      )
    })
  })

  describe("validate with schema using added meta-schema", () => {
    it("should validate valid data", (done) => {
      cli(
        "-s test/meta/schema -d test/meta/valid_data -m test/meta/meta_schema --strict=false",
        (error, stdout, stderr) => {
          assert.strictEqual(error, null)
          assertValid(stdout, 1)
          assert.strictEqual(stderr, "")
          done()
        }
      )
    })

    it("should validate invalid data", (done) => {
      cli(
        "-s test/meta/schema -d test/meta/invalid_data -m test/meta/meta_schema --errors=line --strict=false",
        (error, stdout, stderr) => {
          assert(error instanceof Error)
          assert.strictEqual(stdout, "")
          const results = assertErrors(stderr)
          const errors = results[0]
          const err = errors[0]
          assert.strictEqual(err.keyword, "type")
          assert.strictEqual(err.instancePath, "/foo")
          assert.strictEqual(err.schemaPath, "#/properties/foo/type")
          done()
        }
      )
    })

    it("should fail on invalid schema", (done) => {
      cli(
        "-s test/meta/invalid_schema -d test/meta/valid_data -m test/meta/meta_schema --errors=line",
        (error, stdout, stderr) => {
          assert(error instanceof Error)
          assert.strictEqual(stdout, "")
          const lines = stderr.split("\n")
          assert.strictEqual(lines.length, 3)
          assert(lines[0].includes("schema"))
          assert(lines[0].includes("invalid"))
          assert(lines[1].includes("error"))
          assert(/my_keyword\smust\sbe\sboolean/.test(lines[1]))
          done()
        }
      )
    })
  })

  describe('option "changes"', () => {
    it("should log changes in the object after validation", (done) => {
      cli(
        "-s test/schema -d test/data_with_additional --remove-additional  --changes=line",
        (error, stdout, stderr) => {
          assert.strictEqual(error, null)
          const lines = assertValid(stdout, 1, 2)
          assert(lines[1].includes("changes"))
          const changes = JSON.parse(lines[2])
          assert.deepStrictEqual(changes, [
            {op: "remove", path: "/1/additionalInfo"},
            {op: "remove", path: "/0/additionalInfo"},
          ])
          assert.strictEqual(stderr, "")
          done()
        }
      )
    })
  })

  describe('option "data"', () => {
    it("should exit with error when not specified in the presence of `$data` references", (done) => {
      cli(
        "validate -s test/schema_with_data_reference -d test/data_for_schema_with_data_reference",
        (error, stdout, stderr) => {
          assert(error instanceof Error)
          assert.strictEqual(stdout, "")
          assert(stderr.includes("test/schema_with_data_reference is invalid"))
          assert(stderr.includes("larger/minimum"))
          assert(stderr.includes("must be number"))
          done()
        }
      )
    })

    it("it should enable `$data` references when specified", (done) => {
      cli(
        "validate --data -s test/schema_with_data_reference -d test/data_for_schema_with_data_reference",
        (error, stdout, stderr) => {
          assert.strictEqual(error, null)
          assertValid(stdout, 1)
          assert.strictEqual(stderr, "")
          done()
        }
      )
    })
  })

  describe("custom keywords", () => {
    it("should validate valid data; custom keyword definition in file", (done) => {
      cli(
        "validate -s test/custom/schema -c ./test/custom/typeof.js -d test/custom/valid_data",
        (error, stdout, stderr) => {
          assert.strictEqual(error, null)
          assertValid(stdout, 1)
          assert.strictEqual(stderr, "")
          done()
        }
      )
    })

    it("should validate valid data; custom keyword definition in package", (done) => {
      cli(
        "validate -s test/custom/schema -c ajv-keywords/dist/keywords/typeof -d test/custom/valid_data",
        (error, stdout, stderr) => {
          assert.strictEqual(error, null)
          assertValid(stdout, 1)
          assert.strictEqual(stderr, "")
          done()
        }
      )
    })

    it("should validate invalid data; custom keyword definition in file", (done) => {
      cli(
        "validate -s test/custom/schema -c ./test/custom/typeof.js -d test/custom/invalid_data --errors=line",
        (error, stdout, stderr) => {
          assert(error instanceof Error)
          assert.strictEqual(stdout, "")
          const results = assertErrors(stderr)
          const errors = results[0]
          const err = errors[0]
          assert.strictEqual(err.keyword, "typeof")
          assert.strictEqual(err.instancePath, "")
          assert.strictEqual(err.schemaPath, "#/typeof")
          done()
        }
      )
    })

    it("should validate invalid data; custom keyword definition in package", (done) => {
      cli(
        "validate -s test/custom/schema -c ajv-keywords/dist/keywords/typeof -d test/custom/invalid_data --errors=line",
        (error, stdout, stderr) => {
          assert(error instanceof Error)
          assert.strictEqual(stdout, "")
          const results = assertErrors(stderr)
          const errors = results[0]
          const err = errors[0]
          assert.strictEqual(err.keyword, "typeof")
          assert.strictEqual(err.instancePath, "")
          assert.strictEqual(err.schemaPath, "#/typeof")
          done()
        }
      )
    })
  })
})

function assertValid(stdout: string, count: number, extraLines = 0): string[] {
  const lines = stdout.split("\n")
  assert.strictEqual(lines.length, count + extraLines + 1)
  for (let i = 0; i < count; i++) assert(/\svalid/.test(lines[i]))
  return lines
}

function assertRequiredErrors(stderr: string, schemaRef = "#", count = 1): void {
  const results = assertErrors(stderr, count)
  results.forEach((errors) => {
    const err = errors[0]
    assert.strictEqual(err.keyword, "required")
    assert.strictEqual(err.instancePath, "/0/dimensions")
    assert.strictEqual(err.schemaPath, schemaRef + "/items/properties/dimensions/required")
    assert.deepStrictEqual(err.params, {missingProperty: "height"})
  })
}

function assertErrors(stderr: string, count = 1): DefinedError[][] {
  const lines = stderr.split("\n")
  assert.strictEqual(lines.length, count * 2 + 1)
  const results: DefinedError[][] = []
  for (let i = 0; i < count; i += 2) {
    assert(/\sinvalid/.test(lines[i]))
    const errors = JSON.parse(lines[i + 1])
    assert.strictEqual(errors.length, 1)
    results.push(errors)
  }
  return results
}
