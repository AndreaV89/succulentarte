// functions/eslint.config.js

import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // 1. Dice a ESLint di NON analizzare il suo stesso file di configurazione
    ignores: ["eslint.config.js"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        process: "readonly",
        __dirname: "readonly",
      },
    },
    // 2. Aggiungiamo questa sezione per risolvere il conflitto tra le regole
    rules: {
      // Disabilita la regola base di ESLint per evitare conflitti
      "no-unused-expressions": "off",
      // Abilita esplicitamente la versione TypeScript della stessa regola
      "@typescript-eslint/no-unused-expressions": "error",
    },
  }
);
