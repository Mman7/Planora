import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier/flat";
import sonarjs from "eslint-plugin-sonarjs";
import tseslint from "typescript-eslint";

const commonFiles = ["**/*.{js,jsx,mjs,cjs,ts,tsx}"];
const jsFiles = ["**/*.{js,jsx,mjs,cjs}"];
const tsFiles = ["**/*.{ts,tsx}"];

const unusedVarsOptions = {
  args: "all",
  argsIgnorePattern: "^_",
  varsIgnorePattern: "^_",
  caughtErrors: "all",
  caughtErrorsIgnorePattern: "^_",
  ignoreRestSiblings: true,
};

const codeQualityRules = {
  // Complexity
  complexity: ["error", 10],
  "max-depth": ["error", 3],
  "max-nested-callbacks": ["error", 3],
  "max-params": ["error", 4],
  "max-statements": ["error", 25],

  "max-lines-per-function": [
    "error",
    {
      max: 80,
      skipBlankLines: true,
      skipComments: true,
      IIFEs: true,
    },
  ],

  "max-lines": [
    "error",
    {
      max: 800,
      skipBlankLines: true,
      skipComments: true,
    },
  ],

  // Dangerous patterns
  "no-debugger": "error",
  "no-eval": "error",
  "no-implied-eval": "error",
  "no-new-func": "error",
  "no-nested-ternary": "error",
  "no-else-return": "error",
  "no-lonely-if": "error",
  "no-constant-binary-expression": "error",
  "no-duplicate-imports": "error",
  "no-duplicate-case": "error",
  "no-fallthrough": "error",
  "no-self-compare": "error",
  "no-unsafe-finally": "error",
  "no-async-promise-executor": "error",
  "no-promise-executor-return": "error",
  "no-useless-catch": "error",
  "no-useless-return": "error",
  "no-useless-concat": "error",
  "no-useless-rename": "error",
  "no-unneeded-ternary": "error",
  "no-unreachable": "error",
  "no-constant-condition": "error",

  // Consistency
  eqeqeq: ["error", "always"],
  curly: ["error", "all"],

  // Console
  "no-console": [
    "warn",
    {
      allow: ["warn", "error"],
    },
  ],
};

export default defineConfig([
  // ==================================================
  // 1. Global ignores
  // ==================================================

  globalIgnores([
    "**/node_modules/**",
    "**/.next/**",
    "**/.wrangler/**",
    "**/out/**",
    "**/build/**",
    "**/dist/**",
    "**/coverage/**",
    "**/.turbo/**",
    "**/drizzle/migrations/**",
    "**/next-env.d.ts",
  ]),

  // ==================================================
  // 2. Next.js + React + Core Web Vitals
  // ==================================================

  ...nextVitals,

  // ==================================================
  // 3. JavaScript baseline
  // ==================================================

  {
    files: jsFiles,

    extends: [js.configs.recommended],

    rules: {
      ...codeQualityRules,

      "no-unused-vars": ["error", unusedVarsOptions],
    },
  },

  // ==================================================
  // 4. TypeScript baseline
  // ==================================================

  {
    files: tsFiles,

    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },

    extends: [tseslint.configs.recommended],

    rules: {
      ...codeQualityRules,

      "no-unused-vars": "off",

      "@typescript-eslint/no-unused-vars": ["error", unusedVarsOptions],

      "@typescript-eslint/no-explicit-any": "error",

      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": "allow-with-description",
          "ts-ignore": true,
          "ts-nocheck": true,
          minimumDescriptionLength: 10,
        },
      ],
    },
  },

  // ==================================================
  // 5. Strict TypeScript + Type-aware linting
  // ==================================================

  {
    files: ["apps/**/*.{ts,tsx}", "packages/**/*.ts"],

    ignores: [
      "**/*.config.ts",
      "**/*.config.mts",
      "**/*.config.cts",
      "**/*.d.ts",
    ],

    extends: [
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],

    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },

    rules: {
      // Type safety
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unsafe-argument": "error",

      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/only-throw-error": "error",

      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",

      "@typescript-eslint/no-non-null-assertion": "error",

      "@typescript-eslint/switch-exhaustiveness-check": "error",

      // Type consistency
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
        },
      ],

      "@typescript-eslint/consistent-type-definitions": ["error", "type"],

      "@typescript-eslint/consistent-indexed-object-style": ["error", "record"],

      "@typescript-eslint/consistent-generic-constructors": [
        "error",
        "constructor",
      ],

      "@typescript-eslint/no-confusing-void-expression": "error",

      // Dangerous TypeScript escape hatches
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": "allow-with-description",
          "ts-ignore": true,
          "ts-nocheck": true,
          minimumDescriptionLength: 10,
        },
      ],
    },
  },

  // ==================================================
  // 6. SonarJS - Cognitive complexity and code smells
  // ==================================================

  {
    files: commonFiles,

    plugins: {
      sonarjs,
    },

    rules: {
      "sonarjs/cognitive-complexity": ["error", 15],

      "sonarjs/no-identical-functions": "error",
      "sonarjs/no-collapsible-if": "error",
      "sonarjs/no-redundant-boolean": "error",
      "sonarjs/no-gratuitous-expressions": "error",

      "sonarjs/no-duplicate-string": [
        "error",
        {
          threshold: 3,
        },
      ],
    },
  },

  // ==================================================
  // 7. React / Next.js specific rules
  // ==================================================

  {
    files: ["apps/web/**/*.{jsx,tsx}"],

    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",

      "react/jsx-no-useless-fragment": "error",
      "react/no-unstable-nested-components": "error",
    },
  },

  {
    files: ["apps/web/src/components/ui/calendar.tsx"],

    rules: {
      "max-lines-per-function": "off",
      "react/no-unstable-nested-components": "off",
    },
  },

  {
    files: ["eslint.config.mjs"],

    rules: {
      "sonarjs/no-duplicate-string": "off",
    },
  },

  // ==================================================
  // 8. Backend architecture boundaries
  // Route -> Controller -> Service -> Repository
  // ==================================================

  // Routes cannot directly access services, repositories or DB.
  {
    files: ["apps/api/src/modules/**/*.routes.ts"],

    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "**/*.service",
                "**/*.service.*",
                "**/*.repository",
                "**/*.repository.*",
                "**/db/**",
                "**/database/**",
              ],
              message:
                "Routes must use Controllers. Do not access Services, Repositories or Database directly.",
            },
          ],
        },
      ],
    },
  },

  // Controllers must use Services.
  {
    files: ["apps/api/src/modules/**/*.controller.ts"],

    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "**/*.routes",
                "**/*.repository",
                "**/*.repository.*",
                "**/db/**",
                "**/database/**",
              ],
              message:
                "Controllers must use Services. Do not access Routes, Repositories or Database directly.",
            },
          ],
        },
      ],
    },
  },

  // Services must use Repositories.
  {
    files: ["apps/api/src/modules/**/*.service.ts"],

    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "**/*.routes",
                "**/*.controller",
                "**/db/**",
                "**/database/**",
              ],
              message:
                "Services must use Repositories. Do not access Routes, Controllers or Database directly.",
            },
          ],
        },
      ],
    },
  },

  // Repositories must not depend on upper application layers.
  {
    files: ["apps/api/src/modules/**/*.repository.ts"],

    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/*.routes", "**/*.controller", "**/*.service"],
              message:
                "Repositories must not depend on Routes, Controllers or Services.",
            },
          ],
        },
      ],
    },
  },

  // ==================================================
  // 9. Scheduling Engine isolation
  // Keep it framework and infrastructure independent.
  // ==================================================

  {
    files: ["packages/scheduling-engine/src/**/*.ts"],

    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "hono",
              message: "Scheduling Engine must remain framework-independent.",
            },
            {
              name: "drizzle-orm",
              message:
                "Scheduling Engine must not depend on database infrastructure.",
            },
            {
              name: "react",
              message:
                "Scheduling Engine must not depend on frontend frameworks.",
            },
            {
              name: "next",
              message: "Scheduling Engine must not depend on Next.js.",
            },
            {
              name: "@google/generative-ai",
              message: "Scheduling Engine must not depend on AI providers.",
            },
            {
              name: "better-auth",
              message:
                "Scheduling Engine must not depend on authentication infrastructure.",
            },
          ],

          patterns: [
            {
              group: [
                "hono/**",
                "drizzle-orm/**",
                "react/**",
                "next/**",
                "@google/generative-ai/**",
                "better-auth/**",
                "cloudflare:workers",
                "**/database/**",
                "**/repositories/**",
                "**/providers/**",
                "**/infrastructure/**",
              ],
              message:
                "Scheduling Engine must remain a pure TypeScript package without framework, database, authentication or AI provider dependencies.",
            },
          ],
        },
      ],
    },
  },

  // ==================================================
  // 10. Test files - allow flexibility
  // ==================================================

  {
    files: [
      "**/*.test.{js,jsx,ts,tsx}",
      "**/*.spec.{js,jsx,ts,tsx}",
      "**/__tests__/**/*.{js,jsx,ts,tsx}",
      "**/__mocks__/**/*.{js,jsx,ts,tsx}",
    ],

    rules: {
      "max-lines-per-function": "off",
      "max-statements": "off",
      "max-lines": "off",
      "max-depth": "off",
      "max-nested-callbacks": "off",

      "sonarjs/no-duplicate-string": "off",
    },
  },

  // ==================================================
  // 11. Config and script files
  // ==================================================

  {
    files: [
      "*.config.{js,mjs,cjs,ts,mts,cts}",
      "**/*.config.{js,mjs,cjs,ts,mts,cts}",
      "scripts/**/*.{js,mjs,cjs,ts}",
    ],

    rules: {
      "max-lines": "off",
      "max-lines-per-function": "off",
      "max-statements": "off",
    },
  },

  // ==================================================
  // 12. Prettier compatibility
  // Must stay after other rule configurations.
  // ==================================================

  prettier,
]);
