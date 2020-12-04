import cli from "./cli"
import assert = require("assert")

describe("help", function () {
  this.timeout(10000)

  it("should print help", (done) => {
    cli("help", (error, stdout, stderr) => {
      assert.strictEqual(error, null)
      assert(stdout.includes("Validate"))
      assert(stdout.includes("Compile"))
      assert.strictEqual(stderr, "")
      done()
    })
  })

  it("should print help for validate", (done) => {
    cli("help validate", (error, stdout, stderr) => {
      assert.strictEqual(error, null)
      assert(stdout.includes("Validate"))
      assert(stdout.includes("options"))
      assert.strictEqual(stderr, "")
      done()
    })
  })

  it("should print help for compile", (done) => {
    cli("help compile", (error, stdout, stderr) => {
      assert.strictEqual(error, null)
      assert(stdout.includes("Compile"))
      assert(stdout.includes("options"))
      assert.strictEqual(stderr, "")
      done()
    })
  })

  it("should print help for migrate", (done) => {
    cli("help migrate", (error, stdout, stderr) => {
      assert.strictEqual(error, null)
      assert(stdout.includes("Migrate"))
      assert(stdout.includes("options"))
      assert.strictEqual(stderr, "")
      done()
    })
  })

  it("should print help for test", (done) => {
    cli("help test", (error, stdout, stderr) => {
      assert.strictEqual(error, null)
      assert(stdout.includes("Test"))
      assert(stdout.includes("options"))
      assert.strictEqual(stderr, "")
      done()
    })
  })

  it("should print usage if unknown command is used", (done) => {
    cli("unknown", (error, stdout, stderr) => {
      assert(error instanceof Error)
      assert.strictEqual(stdout, "")
      assert(stderr.includes("command"))
      assert(stderr.includes("unknown"))
      assert(stderr.includes("usage"))
      done()
    })
  })

  it("should print usage if help command is unknown", (done) => {
    cli("help unknown", (error, stdout, stderr) => {
      assert(error instanceof Error)
      assert.strictEqual(stdout, "")
      assert(stderr.includes("command"))
      assert(stderr.includes("unknown"))
      assert(stderr.includes("usage"))
      done()
    })
  })

  it("should print usage if syntax is invalid", (done) => {
    cli("help -s test/schema.json", (error, stdout, stderr) => {
      assert(error instanceof Error)
      assert.strictEqual(stdout, "")
      assert(stderr.includes("usage"))
      assert(stderr.includes("parameter"))
      assert(stderr.includes("unknown"))
      done()
    })
  })
})
