import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  // Ignore generated files
  globalIgnores([
    "**/node_modules/**",
    "**/.next/**",
    "**/.wrangler/**",
    "**/dist/**",
    "**/coverage/**",
    "**/drizzle/migrations/**",
  ]),

  // JavaScript / TypeScript
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],

    extends: [js.configs.recommended, ...tseslint.configs.recommended],

    rules: {
      // Code quality
      "no-debugger": "error",
      "no-nested-ternary": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // TypeScript
      "@typescript-eslint/no-explicit-any": "error",

      // Avoid duplicate base TypeScript checks
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // TypeScript escape hatches
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-ignore": true,
          "ts-nocheck": true,
          "ts-expect-error": "allow-with-description",
        },
      ],

      // Maintainability
      complexity: ["error", 10],
      "max-depth": ["error", 4],
      "max-params": ["error", 4],
      "max-lines": [
        "error",
        {
          max: 800,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
]);
