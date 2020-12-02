"use strict"

const {exec} = require("child_process")
const path = require("path")
const CWD = path.join(__dirname, "..")

module.exports = function cli(params, callback) {
  exec("node dist/index " + params, {cwd: CWD}, callback)
}
