#! /usr/bin/env node

import minimist = require("minimist")
import commands from "./commands"
import {checkOptions} from "./commands/options"

const argv = minimist(process.argv.slice(2))
const command = argv._[0] || "validate"
const cmd = commands[command]

if (cmd) {
  const errors = checkOptions(cmd.schema, argv)
  if (errors) {
    console.error(errors)
    commands.help?.usage?.()
    process.exit(2)
  } else {
    const ok = cmd.execute(argv)
    process.exit(ok ? 0 : 1)
  }
} else {
  console.error("Unknown command", command)
  commands.help?.usage?.()
  process.exit(2)
}
