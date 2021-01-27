#! /usr/bin/env node

import minimist = require("minimist")
import commands from "./commands"
import {checkOptions} from "./commands/options"
import usage from "./commands/usage"
import type {CmdName} from "./commands/types"

const argv = minimist(process.argv.slice(2))
const command = argv._[0] || "validate"
if (command in commands) {
  const cmd = commands[command as CmdName]
  const errors = checkOptions(cmd.schema, argv)
  if (errors) {
    console.error(errors)
    usage()
    process.exit(2)
  } else {
    cmd
      .execute(argv)
      .then((ok: boolean) => {
        process.exit(ok ? 0 : 1)
      })
      .catch(() => {
        process.exit(1)
      })
  }
} else {
  console.error(`Unknown command ${command}`)
  usage()
  process.exit(2)
}
