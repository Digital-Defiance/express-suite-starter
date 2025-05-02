/**
 * Monorepo generator configuration and package lists.
 */

export const LINTER = "eslint";
export const UNIT_TEST_RUNNER = "jest";
export const E2E_TEST_RUNNER = "playwright";
export const STYLE = "scss";
export const BUNDLER = "vite";
export const CI_PROVIDER = "github";
export const NODE_API_E2E_TEST_RUNNER = "jest";
export const NODE_API_FRAMEWORK = "express";
export const LIB_BUNDLER = "none";
export const NVM_USE_VERSION = "22";
export const YARN_VERSION = "4.11.0";

export const devPackages: string[] = [
  '@digitaldefiance/express-suite-test-utils@1.0.3',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/parser',
  'eslint-config-prettier',
  'eslint-plugin-prettier',
  'eslint-plugin-react',
  'eslint-plugin-react-hooks',
  'eslint-plugin-import',
  'eslint-plugin-jsx-a11y',
  'eslint-plugin-playwright',
  'mongodb-memory-server',
  'supertest',
  '@types/cors',
  '@types/express',
  '@types/jsonwebtoken',
  '@types/supertest',
  '@types/node',
  '@types/react',
  '@types/react-dom'
];

export const packages: string[] = [
  '@digitaldefiance/node-express-suite@2.1.25',
  '@digitaldefiance/ecies-lib@2.1.26',
  '@digitaldefiance/node-ecies-lib@2.1.27',
  '@digitaldefiance/i18n-lib@2.1.25',
  '@digitaldefiance/suite-core-lib@2.1.25',
  '@emotion/react',
  '@emotion/styled',
  '@mui/icons-material',
  '@mui/material',
  '@mui/system',
  'axios',
  'cors',
  'dotenv',
  'express',
  'helmet',
  'jsonwebtoken',
  'mongodb',
  'mongoose',
];

export const addScripts: Record<string, string> = {
  "build": "NODE_ENV=production npx nx run-many --target=build --all --configuration=production && yarn postbuild",
  "build:dev": "NODE_ENV=development npx nx run-many --target=build --all --configuration=development && yarn postbuild",
  "build:api": `npx nx build \${apiAppName} && yarn postbuild`,
  "build:api:dev": `npx nx build \${apiAppName} --configuration development && yarn postbuild`,
  "build:react": `npx nx build \${reactAppName}`,
  "build:react:dev": `npx nx build \${reactAppName} --configuration development`,
  "test:all": "yarn test:jest && yarn test:e2e",
  "test:jest": "NODE_ENV=development npx nx run-many --target=test --all --configuration=development",
  "test:e2e": `npx nx e2e \${apiAppName}-e2e --runInBand`,
  "test:e2e:single": `npx nx e2e \${apiAppName}-e2e --runInBand --testFile`,
  "serve": `npx nx serve \${apiAppName} --configuration production`,
  "serve:dev": `npx nx serve \${apiAppName} --configuration development`,
  "build-serve:dev": "yarn build:dev && yarn serve:dev",
  "postbuild": `cp ./\${apiAppName}/.env ./dist/\${apiAppName}/.env`,
  "npm:install-globals": "./npm-install-globals.sh",
  "lint:all": "npx nx run-many --target=lint --all",
  "prettier:check": "prettier --check '**/*.{ts,tsx}'",
  "prettier:fix": "prettier --write '**/*.{ts,tsx}'",
  "migrate:latest": "npx nx migrate latest",
  "migrate:run-migrations": "npx nx migrate --run-migrations",
  "upgrade:all": "./do-yarn.sh upgrade",
  "commands": "./list-scripts.sh"
};
