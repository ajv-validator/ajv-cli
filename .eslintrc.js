const jsConfig = require("@ajv-validator/config/.eslintrc_js")
const tsConfig = require("@ajv-validator/config/.eslintrc")

module.exports = {
  env: {
    es6: true,
    node: true,
  },
  overrides: [
    {
      ...jsConfig,
      rules: {
        ...jsConfig.rules,
        "no-console": "off",
        "no-invalid-this": "off",
      },
    },
    {
      ...tsConfig,
      files: ["*.ts"],
      rules: {
        ...tsConfig.rules,
        complexity: ["error", 15],
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unnecessary-condition": "warn",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
      },
    },
  ],
}
