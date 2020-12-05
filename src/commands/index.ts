import type {Command, CmdName} from "./types"
import compile from "./compile"
import help from "./help"
import validate from "./validate"
import migrate from "./migrate"
import test from "./test"

const commands: {[Name in CmdName]: Command} = {
  help,
  compile,
  validate,
  migrate,
  test,
}

export default commands
