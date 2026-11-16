/**
 * Jest transformer for the ESM-only node_modules JS that is allowlisted in
 * transformIgnorePatterns (react-router v8+, @remix-run, cookie-es).
 *
 * react-router v8 is shipped as ESM (`"type": "module"`) and contains a dead
 * HMR guard that reads `import.meta.hot`. Compiled to CommonJS for jest, that
 * would throw "Cannot use 'import.meta' outside a module", so we rewrite only
 * `import.meta.hot` to `undefined` before downleveling the ESM to CommonJS
 * with @babel/core. Any other `import.meta` use is left alone and fails
 * loudly in jest; rewrite that exact member here (and name the package) if a
 * legitimate use shows up. This only ever runs against the allowlisted
 * dependencies.
 */
const babel = require('@babel/core');
module.exports = {
  canInstrument: false,
  process(sourceText, sourcePath) {
    const neutralized = sourceText.replace(/\bimport\.meta\.hot\b/g, 'undefined');
    const result = babel.transformSync(neutralized, {
      filename: sourcePath,
      sourceType: 'module',
      babelrc: false,
      configFile: false,
      presets: [
        [
          '@babel/preset-env',
          { targets: { node: 'current' }, modules: 'commonjs' },
        ],
      ],
      sourceMaps: 'inline',
    });
    return { code: result.code, map: result.map };
  },
  getCacheKey(sourceText, sourcePath) {
    return `${sourcePath}:${sourceText.length}:esm-js-transformer:v3`;
  },
};
