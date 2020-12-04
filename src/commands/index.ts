import type {Command} from "./types"
import compile from "./compile"
import help from "./help"
import validate from "./validate"
import migrate from "./migrate"
import test from "./test"

const commands: {[Cmd in string]?: Command} = {
  compile,
  help,
  validate,
  migrate,
  test,
}

export default commands
