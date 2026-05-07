module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  modulePaths: ['<rootDir>'],
  moduleDirectories: ['node_modules', '<rootDir>/../../node_modules'],
  moduleNameMapper: {
    '^lru-cache$': '<rootDir>/__mocks__/lru-cache.js',
    '^@digitaldefiance/i18n-lib$':
      '<rootDir>/../../dist/packages/digitaldefiance-i18n-lib/src/index.js',
    '^@digitaldefiance/suite-core-lib$':
      '<rootDir>/../../dist/packages/digitaldefiance-suite-core-lib/src/index.js',
    '^@digitaldefiance/ecies-lib$':
      '<rootDir>/../../dist/packages/digitaldefiance-ecies-lib/src/index.js',
    // fast-check@4.x requires pure-rand@^8.x, but the root node_modules has pure-rand@7.x
    // (used by jest-circus). Map all pure-rand subpath imports to the version nested under fast-check.
    '^pure-rand/generator/(.*)$':
      '<rootDir>/../../node_modules/fast-check/node_modules/pure-rand/lib/generator/$1.js',
    '^pure-rand/distribution/(.*)$':
      '<rootDir>/../../node_modules/fast-check/node_modules/pure-rand/lib/distribution/$1.js',
    '^pure-rand/utils/(.*)$':
      '<rootDir>/../../node_modules/fast-check/node_modules/pure-rand/lib/utils/$1.js',
  },
  setupFiles: ['<rootDir>/../../jest.setup.js'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/*.spec.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.test.json',
      },
    ],
  },
};
