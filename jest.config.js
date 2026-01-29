module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  modulePaths: ['<rootDir>'],
  moduleDirectories: ['node_modules', '<rootDir>/../../node_modules'],
  moduleNameMapper: {
    '^lru-cache$': '<rootDir>/__mocks__/lru-cache.js',
    '^@digitaldefiance/i18n-lib$': '<rootDir>/../../dist/packages/digitaldefiance-i18n-lib/src/index.js',
    '^@digitaldefiance/suite-core-lib$': '<rootDir>/../../dist/packages/digitaldefiance-suite-core-lib/src/index.js',
    '^@digitaldefiance/ecies-lib$': '<rootDir>/../../dist/packages/digitaldefiance-ecies-lib/src/index.js',
  },
  setupFiles: ['<rootDir>/../../jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.spec.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.test.json',

    }],
  },
};
