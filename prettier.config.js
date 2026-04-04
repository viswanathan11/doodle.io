/** @type {import("prettier").Config} */
const config = {
  // Keep lines readable and encourage JSX props to wrap cleanly.
  printWidth: 80,
  singleAttributePerLine: true,

  // Match the requested code style.
  semi: true,
  singleQuote: false,
  jsxSingleQuote: false,

  // Readability-focused spacing and punctuation.
  tabWidth: 2,
  useTabs: false,
  trailingComma: "all",
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",
  quoteProps: "as-needed",
  endOfLine: "lf",

  overrides: [
    {
      files: ["*.md"],
      options: {
        proseWrap: "preserve",
      },
    },
  ],
};

module.exports = config;
