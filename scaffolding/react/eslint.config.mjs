import nx from '@nx/eslint-plugin';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import baseConfig from '../eslint.config.mjs';

// nx.configs['flat/react'] contains a config object that applies
// @typescript-eslint/* rules without registering the plugin in that same
// flat-config object, which ESLint 9 rejects. Inject the plugin into any such
// object so the rules resolve.
const reactConfigs = nx.configs['flat/react'].map((config) =>
  config.rules &&
  Object.keys(config.rules).some((rule) =>
    rule.startsWith('@typescript-eslint/'),
  ) &&
  !config.plugins?.['@typescript-eslint']
    ? {
        ...config,
        plugins: { ...config.plugins, '@typescript-eslint': typescriptPlugin },
      }
    : config,
);

export default [
  // Jest-only CommonJS helper, not part of the TS project; skip type-aware lint.
  { ignores: ['src/esm-js-transformer.js'] },
  ...baseConfig,
  ...reactConfigs,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
];
