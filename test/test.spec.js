"use strict"

const cli = require("./cli")
const assert = require("assert")

describe("test", function () {
  this.timeout(10000)

  describe("test valid data", () => {
    it("should pass if expected result is valid", (done) => {
      cli("test -s test/schema -d test/valid_data --valid", (error, stdout, stderr) => {
        assert.strictEqual(error, null)
        assertNoErrors(stdout, 1, /\spassed/)
        assert.equal(stderr, "")
        done()
      })
    })

    it("should pass multiple files if expected result is valid", (done) => {
      cli('test -s test/schema -d "test/valid*.json" --valid', (error, stdout, stderr) => {
        assert.strictEqual(error, null)
        assertNoErrors(stdout, 2, /\spassed/)
        assert.equal(stderr, "")
        done()
      })
    })

    it("should fail if expected result is invalid", (done) => {
      cli("test -s test/schema -d test/valid_data --invalid", (error, stdout, stderr) => {
        assert(error instanceof Error)
        assertNoErrors(stderr, 1, /\sfailed/)
        assert.equal(stdout, "")
        done()
      })
    })

    it("should fail multiple files if expected result is invalid", (done) => {
      cli('test -s test/schema -d "test/valid*.json" --invalid', (error, stdout, stderr) => {
        assert(error instanceof Error)
        assertNoErrors(stderr, 2, /\sfailed/)
        assert.equal(stdout, "")
        done()
      })
    })
  })

  describe("test invalid data", () => {
    it("should pass if expected result is invalid", (done) => {
      cli(
        "test -s test/schema -d test/invalid_data --invalid --errors=line",
        (error, stdout, stderr) => {
          assert.strictEqual(error, null)
          assertRequiredErrors(stdout, 1, /\spassed/)
          assert.equal(stderr, "")
          done()
        }
      )
    })

    it("should pass if expected result is invalid (valid=false)", (done) => {
      cli(
        "test -s test/schema -d test/invalid_data --valid=false --errors=line",
        (error, stdout, stderr) => {
          assert.strictEqual(error, null)
          assertRequiredErrors(stdout, 1, /\spassed/)
          assert.equal(stderr, "")
          done()
        }
      )
    })

    it("should pass multiple files if expected result is invalid", (done) => {
      cli(
        'test -s test/schema -d "test/invalid*.json" --invalid --errors=line',
        (error, stdout, stderr) => {
          assert.strictEqual(error, null)
          assertRequiredErrors(stdout, 2, /\spassed/)
          assert.equal(stderr, "")
          done()
        }
      )
    })

    it("should fail if expected result is valid", (done) => {
      cli(
        "test -s test/schema -d test/invalid_data --valid --errors=line",
        (error, stdout, stderr) => {
          assert(error instanceof Error)
          assertRequiredErrors(stderr, 1, /\sfailed/)
          assert.equal(stdout, "")
          done()
        }
      )
    })

    it("should fail multiple files if expected result is valid", (done) => {
      cli(
        'test -s test/schema -d "test/invalid*.json" --valid --errors=line',
        (error, stdout, stderr) => {
          assert(error instanceof Error)
          assertRequiredErrors(stderr, 2, /\sfailed/)
          assert.equal(stdout, "")
          done()
        }
      )
    })
  })

  describe("test valid and invalid data", () => {
    it("should pass valid, fail invalid and return error if expected result is valid", (done) => {
      cli(
        "test -s test/schema -d test/valid_data -d test/invalid_data --valid --errors=line",
        (error, stdout, stderr) => {
          assert(error instanceof Error)
          assertNoErrors(stdout, 1, /\spassed/)
          assertRequiredErrors(stderr, 1, /\sfailed/)
          done()
        }
      )
    })

    it("should fail valid, pass invalid and return error if expected result is invalid", (done) => {
      cli(
        "test -s test/schema -d test/valid_data -d test/invalid_data --invalid --errors=line",
        (error, stdout, stderr) => {
          assert(error instanceof Error)
          assertNoErrors(stderr, 1, /\sfailed/)
          assertRequiredErrors(stdout, 1, /\spassed/)
          done()
        }
      )
    })
  })
})

function assertNoErrors(out, count, regexp) {
  const lines = out.split("\n")
  assert.equal(lines.length, count + 1)
  for (let i = 0; i < count; i++) assert(regexp.test(lines[i]))
}

function assertErrors(out, count, regexp) {
  const lines = out.split("\n")
  assert.equal(lines.length, count * 2 + 1)
  const results = []
  for (let i = 0; i < count; i += 2) {
    assert(regexp.test(lines[i]))
    results.push(JSON.parse(lines[i + 1]))
  }
  return results
}

function assertRequiredErrors(out, count, regexp, schemaRef) {
  schemaRef = schemaRef || "#"
  const results = assertErrors(out, count, regexp)
  results.forEach((errors) => {
    const err = errors[0]
    assert.equal(err.keyword, "required")
    assert.equal(err.dataPath, "[0].dimensions")
    assert.equal(err.schemaPath, schemaRef + "/items/properties/dimensions/required")
    assert.deepEqual(err.params, {missingProperty: "height"})
  })
}
