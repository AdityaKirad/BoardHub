/* eslint-disable import-x/no-named-as-default-member */
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import-x";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "**/.*",
      "/.react-router/",
      "/build/",
      "/db.sqlite",
      "!**/.server",
      "!**/.client",
    ],
  },

  js.configs.recommended,

  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],

  reactHooks.configs.flat.recommended,

  jsxA11y.flatConfigs.recommended,

  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,

  prettier,

  {
    files: ["**/*.{ts,tsx}"],

    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],

    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },

      globals: {
        ...globals.browser,
        ...globals.es2024,
      },
    },

    settings: {
      react: {
        version: "detect",
      },

      formComponents: ["Form"],

      linkComponents: [
        {
          name: "Link",
          linkAttribute: "to",
        },
        {
          name: "NavLink",
          linkAttribute: "to",
        },
      ],

      "import/internal-regex": "^~/",

      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },

        node: {
          extensions: [".ts", ".tsx"],
        },
      },
    },

    rules: {
      "react/no-unescaped-entities": "off",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
          disallowTypeAnnotations: true,
        },
      ],

      "@typescript-eslint/consistent-type-exports": "error",
    },
  },

  {
    files: ["**/*.{js,mjs,cjs,jsx}"],

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2024,
      },
    },
  },

  {
    files: ["eslint.config.{js,mjs,cjs}"],

    languageOptions: {
      globals: globals.node,
    },
  },
);
