import type AjvCore from "ajv/dist/core"
import type {ParsedArgs} from "minimist"
import type {SchemaSpec} from "./types"
import Ajv7, {Plugin} from "ajv"
import Ajv2019 from "ajv/dist/2019"
import Ajv2020 from "ajv/dist/2020"
import AjvJTD from "ajv/dist/jtd"
import {Service} from "ts-node"
import {getOptions} from "./options"
import * as util from "./util"
import * as path from "path"
import * as draft6metaSchema from "ajv/lib/refs/json-schema-draft-06.json"

type AjvMethod = "addSchema" | "addMetaSchema"

// copied from https://github.com/babel/babel/blob/d8da63c929f2d28c401571e2a43166678c555bc4/packages/babel-helpers/src/helpers.js#L602-L606
/* istanbul ignore next */
const interopRequireDefault = (obj: any): {default: any} =>
  obj && obj.__esModule ? obj : {default: obj}

const importDefault = <T = unknown>(moduleName: string): T =>
  interopRequireDefault(require(moduleName)).default

const AjvClass: {[S in SchemaSpec]?: typeof AjvCore} = {
  jtd: AjvJTD,
  draft7: Ajv7,
  draft2019: Ajv2019,
  draft2020: Ajv2020,
}

export default function (argv: ParsedArgs): AjvCore {
  const opts = getOptions(argv)
  if (argv.o) opts.code.source = true
  const Ajv: typeof AjvCore = AjvClass[argv.spec as SchemaSpec] || Ajv7
  const ajv = new Ajv(opts)
  let invalid: boolean | undefined
  if (argv.spec !== "jtd") ajv.addMetaSchema(draft6metaSchema)
  addSchemas(argv.m, "addMetaSchema", "meta-schema")
  addSchemas(argv.r, "addSchema", "schema")
  customFormatsKeywords(argv.c)
  if (invalid) process.exit(1)
  return ajv

  function addSchemas(
    args: string | string[] | undefined,
    method: AjvMethod,
    fileType: string
  ): void {
    if (!args) return
    const files = util.getFiles(args)
    files.forEach((file) => {
      const schema = util.openFile(file, fileType)
      try {
        ajv[method](schema)
      } catch (err) {
        console.error(`${fileType} ${file} is invalid`)
        console.error(`error: ${(err as Error).message}`)
        invalid = true
      }
    })
  }

  function customFormatsKeywords(args: string | string[] | undefined): void {
    if (!args) return
    const files = util.getFiles(args)
    files.forEach((file) => {
      if (file[0] === ".") file = path.resolve(process.cwd(), file)
      try {
        if (file.endsWith(".ts")) {
          requireTypeScriptKeyword(file)
        } else {
          require(file)(ajv)
        }
      } catch (err) {
        console.error(`module ${file} is invalid; it should export function`)
        console.error(`error: ${(err as Error).message}`)
        invalid = true
      }
    })
  }

  function requireTypeScriptKeyword(file: string): void {
    let registerer: Service

    try {
      registerer = require("ts-node").register()
    } catch (err) {
      /* istanbul ignore next */
      if (err.code === "MODULE_NOT_FOUND") {
        throw new Error(
          `'ts-node' is required for the TypeScript configuration files. Make sure it is installed\nError: ${err.message}`
        )
      }

      throw err
    }

    registerer.enabled(true)

    importDefault<Plugin<undefined>>(file)(ajv)

    registerer.enabled(false)
  }
}
