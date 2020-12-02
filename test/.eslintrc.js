module.exports = {
  globals: {
    it: false,
    describe: false,
  },
  overrides: [
    {
      files: ["*.ts"],
      parserOptions: {
        project: ["./spec/tsconfig.json"],
      },
      // rules: {
      //   "@typescript-eslint/no-empty-function": "off",
      //   "@typescript-eslint/no-extraneous-class": "off",
      //   "@typescript-eslint/no-var-requires": "off",
      //   "@typescript-eslint/no-unsafe-call": "off",
      // },
    },
  ],
  rules: {
    "no-empty": "off",
  },
}
