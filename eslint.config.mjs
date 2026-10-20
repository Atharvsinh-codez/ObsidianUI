import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([
    ".next/**",
    "out/**",
    "coverage/**",
    "public/r/**",
    "public/_pagefind/**",
    "skills/**",
    ".agents/**",
    "v-prism-recreate-by-athrix/**",
    "UK1Sb-ZRte2Iv3pphsfge-files (1)/**",
    "next-env.d.ts",
  ]),
]);
