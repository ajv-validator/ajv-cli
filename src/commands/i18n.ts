import * as localizeJtd from "ajv-i18n/localize/jtd"
import * as localize from "ajv-i18n"
import {ParsedArgs} from "minimist"

export function i18n(argv: ParsedArgs, errors: any): any {
  if (process.env.AVJ_I18N) {
    const langTag = process.env.AVJ_I18N
    const l: any = argv.spec === "jtd" ? localizeJtd : localize
    const f = l[langTag]
    if (f) {
      f(errors)
    } else {
      console.error(`${langTag} not found in ajv-i18n`)
    }
  }

  return errors
}
