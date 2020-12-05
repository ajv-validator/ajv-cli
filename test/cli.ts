import {exec, ExecException} from "child_process"
import path = require("path")
const cwd = path.join(__dirname, "..")

export default function cli(
  params: string,
  callback?: (error: ExecException | null, stdout: string, stderr: string) => void
): void {
  exec(`node dist/index ${params}`, {cwd}, callback)
}
