import js from "@eslint/js";
import {defineConfig} from "eslint/config";
import ts from "typescript-eslint";
import prettier from "eslint-config-prettier/flat";
import vitest from '@vitest/eslint-plugin'

export default defineConfig([
  {
    files: ["**/*.mts"],
    extends: [
      js.configs.recommended,
      ts.configs.recommended,
      ts.configs.stylistic,
      prettier,
    ],
  },
  {
    files: ["**/*.spec.mts"], plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
    },
  }
]);
