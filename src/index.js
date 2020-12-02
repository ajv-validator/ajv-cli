#! /usr/bin/env node
"use strict"

const argv = require("minimist")(process.argv.slice(2))
const commands = require("./commands")
const options = require("./commands/options")

const command = argv._[0] || "validate"
const cmd = commands[command]

if (cmd) {
  const errors = options.check(cmd.schema, argv)
  if (errors) {
    console.error(errors)
    commands.help.usage()
    process.exit(2)
  } else {
    const ok = cmd.execute(argv)
    process.exit(ok ? 0 : 1)
  }
} else {
  console.error("Unknown command", command)
  commands.help.usage()
  process.exit(2)
}
