module.exports = {
  globals: {
    it: false,
    describe: false,
  },
  overrides: [
    {
      files: ["*.ts"],
      parserOptions: {
        project: ["./test/tsconfig.json"],
      },
      rules: {
        "@typescript-eslint/no-invalid-this": "off",
        //   "@typescript-eslint/no-extraneous-class": "off",
        //   "@typescript-eslint/no-var-requires": "off",
        //   "@typescript-eslint/no-unsafe-call": "off",
      },
    },
  ],
  rules: {
    "no-empty": "off",
  },
}
