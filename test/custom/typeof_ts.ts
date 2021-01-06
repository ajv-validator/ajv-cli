import ajvKeywords from "ajv-keywords"
import {Plugin} from "ajv"

const typeofPlugin: Plugin<undefined> = (ajv) => ajvKeywords(ajv, "typeof")

export default typeofPlugin
