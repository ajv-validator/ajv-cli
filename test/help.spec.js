"use strict"

const cli = require("./cli")
const assert = require("assert")

describe("help", function () {
  this.timeout(10000)

  it("should print help", (done) => {
    cli("help", (error, stdout, stderr) => {
      assert.strictEqual(error, null)
      assert(/Validate/.test(stdout))
      assert(/Compile/.test(stdout))
      assert.equal(stderr, "")
      done()
    })
  })

  it("should print help for validate", (done) => {
    cli("help validate", (error, stdout, stderr) => {
      assert.strictEqual(error, null)
      assert(/Validate/.test(stdout))
      assert(/options/.test(stdout))
      assert.equal(stderr, "")
      done()
    })
  })

  it("should print help for compile", (done) => {
    cli("help compile", (error, stdout, stderr) => {
      assert.strictEqual(error, null)
      assert(/Compile/.test(stdout))
      assert(/options/.test(stdout))
      assert.equal(stderr, "")
      done()
    })
  })

  it("should print help for migrate", (done) => {
    cli("help migrate", (error, stdout, stderr) => {
      assert.strictEqual(error, null)
      assert(/Migrate/.test(stdout))
      assert(/options/.test(stdout))
      assert.equal(stderr, "")
      done()
    })
  })

  it("should print help for test", (done) => {
    cli("help test", (error, stdout, stderr) => {
      assert.strictEqual(error, null)
      assert(/Test/.test(stdout))
      assert(/options/.test(stdout))
      assert.equal(stderr, "")
      done()
    })
  })

  it("should print usage if unknown command is used", (done) => {
    cli("unknown", (error, stdout, stderr) => {
      assert(error instanceof Error)
      assert.equal(stdout, "")
      assert(/command/.test(stderr))
      assert(/unknown/.test(stderr))
      assert(/usage/.test(stderr))
      done()
    })
  })

  it("should print usage if help command is unknown", (done) => {
    cli("help unknown", (error, stdout, stderr) => {
      assert(error instanceof Error)
      assert.equal(stdout, "")
      assert(/command/.test(stderr))
      assert(/unknown/.test(stderr))
      assert(/usage/.test(stderr))
      done()
    })
  })

  it("should print usage if syntax is invalid", (done) => {
    cli("help -s test/schema.json", (error, stdout, stderr) => {
      assert(error instanceof Error)
      assert.equal(stdout, "")
      assert(/usage/.test(stderr))
      assert(/parameter/.test(stderr))
      assert(/unknown/.test(stderr))
      done()
    })
  })
})
