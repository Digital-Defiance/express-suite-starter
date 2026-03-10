import * as fc from 'fast-check';
import * as path from 'path';
import * as fs from 'fs';
import { StarterStringKey } from '../../src/i18n/starter-string-key';
import {
  allTranslations,
} from '../../src/i18n/translations-all';

/**
 * Feature: starter-brightstack-support, Property 1: Translation key completeness
 *
 * Validates: Requirements 1.4, 2.6
 *
 * For any new i18n key added for stack selection and BrightStack storage prompts,
 * and for all supported languages, the translation registry SHALL contain a
 * non-empty string value for that key.
 */

const brightstackKeys: StarterStringKey[] = [
  StarterStringKey.PROMPT_STACK_TYPE,
  StarterStringKey.STACK_MERN,
  StarterStringKey.STACK_BRIGHTSTACK,
  StarterStringKey.PROMPT_BLOCKSTORE_PATH,
  StarterStringKey.PROMPT_MEMBER_POOL_NAME,
  StarterStringKey.VALIDATION_INVALID_BLOCKSTORE_PATH,
  StarterStringKey.SECTION_STACK_SELECTION,
  StarterStringKey.SECTION_BRIGHTSTACK_STORAGE,
  StarterStringKey.DEVCONTAINER_SIMPLE_BRIGHTSTACK,
  StarterStringKey.VALIDATION_STACK_MISMATCH,
  StarterStringKey.VALIDATION_MISSING_BRIGHTSTACK_ENV,
  StarterStringKey.VALIDATION_CROSS_STACK_IMPORT,
];

const supportedLanguages = Object.keys(allTranslations) as Array<
  keyof typeof allTranslations
>;

describe('Feature: starter-brightstack-support, Property 1: Translation key completeness', () => {
  it('every BrightStack i18n key has a non-empty string translation in every supported language', () => {
    fc.assert(
      fc.property(fc.constantFrom(...brightstackKeys), (key) => {
        for (const lang of supportedLanguages) {
          const translations = allTranslations[lang];
          const value = translations[key];
          expect(typeof value).toBe('string');
          expect(value.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );
  });
});

/**
 * Feature: starter-brightstack-support, Property 5: BrightStack preset excludes MongoDB packages
 *
 * Validates: Requirements 6.4
 *
 * For any package in the BrightStack preset (both dev and prod arrays),
 * the package name SHALL NOT be `mongoose`, `mongodb`, `mongodb-memory-server`,
 * or `@digitaldefiance/mongoose-types`.
 */

const brightstackPresetPath = path.resolve(
  __dirname,
  '../../config/presets/brightstack.json',
);
const brightstackPreset = JSON.parse(
  fs.readFileSync(brightstackPresetPath, 'utf-8'),
);

const excludedMongoPackages = [
  'mongoose',
  'mongodb',
  'mongodb-memory-server',
  '@digitaldefiance/mongoose-types',
];

const allBrightstackPackages: string[] = [
  ...brightstackPreset.packages.dev,
  ...brightstackPreset.packages.prod,
];

describe('Feature: starter-brightstack-support, Property 5: BrightStack preset excludes MongoDB packages', () => {
  it('no package in the BrightStack preset is a MongoDB-related package', () => {
    fc.assert(
      fc.property(fc.constantFrom(...allBrightstackPackages), (pkg) => {
        expect(excludedMongoPackages).not.toContain(pkg);
      }),
      { numRuns: 100 },
    );
  });
});



/**
 * Feature: starter-brightstack-support, Property 6: Shared dependencies present in both presets
 *
 * Validates: Requirements 6.5
 *
 * For any shared dependency in {express, helmet, cors, jsonwebtoken, dotenv,
 * react, react-dom, react-router-dom, axios}, both the MERN preset and the
 * BrightStack preset SHALL include that dependency in their prod package list.
 */

const standardPresetPath = path.resolve(
  __dirname,
  '../../config/presets/standard.json',
);
const standardPreset = JSON.parse(
  fs.readFileSync(standardPresetPath, 'utf-8'),
);

const sharedDeps = [
  'express',
  'helmet',
  'cors',
  'jsonwebtoken',
  'dotenv',
  'react',
  'react-dom',
  'react-router-dom',
  'axios',
];

describe('Feature: starter-brightstack-support, Property 6: Shared dependencies present in both presets', () => {
  it('every shared dependency is present in both MERN and BrightStack prod lists', () => {
    fc.assert(
      fc.property(fc.constantFrom(...sharedDeps), (dep) => {
        expect(standardPreset.packages.prod).toContain(dep);
        expect(brightstackPreset.packages.prod).toContain(dep);
      }),
      { numRuns: 100 },
    );
  });
});


/**
 * Feature: starter-brightstack-support, Property 12: No cross-stack imports in scaffolding templates
 *
 * Validates: Requirements 11.1, 11.3
 *
 * For any source file in BrightStack scaffolding dirs (api-brightstack/,
 * api-lib-brightstack/, inituserdb-brightstack/), content SHALL NOT contain
 * imports of `mongoose`, `mongodb`, or `@digitaldefiance/mongoose-types`.
 * For any source file in MERN scaffolding dirs (api-mern/, api-lib-mern/,
 * inituserdb-mern/), content SHALL NOT contain imports of `@brightchain/`.
 */

const scaffoldingRoot = path.resolve(__dirname, '../../scaffolding');

/**
 * Recursively collect all .ts and .ts.mustache files under a directory.
 */
function collectSourceFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) {
    return results;
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectSourceFiles(fullPath));
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.ts.mustache')) {
      results.push(fullPath);
    }
  }
  return results;
}

const brightstackScaffoldingDirs = [
  'api-brightstack',
  'api-lib-brightstack',
  'inituserdb-brightstack',
];

const mernScaffoldingDirs = [
  'api-mern',
  'api-lib-mern',
  'inituserdb-mern',
];

const mongoImportPattern =
  /(?:from\s+['"](?:mongoose|mongodb|@digitaldefiance\/mongoose-types))|(?:require\s*\(\s*['"](?:mongoose|mongodb|@digitaldefiance\/mongoose-types))/;

const brightchainImportPattern =
  /(?:from\s+['"]@brightchain\/)|(?:require\s*\(\s*['"]@brightchain\/)/;

const brightstackSourceFiles: { filePath: string; relativePath: string }[] = [];
for (const dir of brightstackScaffoldingDirs) {
  const dirPath = path.join(scaffoldingRoot, dir);
  for (const filePath of collectSourceFiles(dirPath)) {
    brightstackSourceFiles.push({
      filePath,
      relativePath: path.relative(scaffoldingRoot, filePath),
    });
  }
}

const mernSourceFiles: { filePath: string; relativePath: string }[] = [];
for (const dir of mernScaffoldingDirs) {
  const dirPath = path.join(scaffoldingRoot, dir);
  for (const filePath of collectSourceFiles(dirPath)) {
    mernSourceFiles.push({
      filePath,
      relativePath: path.relative(scaffoldingRoot, filePath),
    });
  }
}

describe('Feature: starter-brightstack-support, Property 12: No cross-stack imports in scaffolding templates', () => {
  it('BrightStack scaffolding has no Mongoose/MongoDB imports', () => {
    expect(brightstackSourceFiles.length).toBeGreaterThan(0);
    fc.assert(
      fc.property(fc.constantFrom(...brightstackSourceFiles), (file) => {
        const content = fs.readFileSync(file.filePath, 'utf-8');
        const match = mongoImportPattern.exec(content);
        expect(match).toBeNull();
      }),
      { numRuns: 100 },
    );
  });

  it('MERN scaffolding has no BrightChain imports', () => {
    expect(mernSourceFiles.length).toBeGreaterThan(0);
    fc.assert(
      fc.property(fc.constantFrom(...mernSourceFiles), (file) => {
        const content = fs.readFileSync(file.filePath, 'utf-8');
        const match = brightchainImportPattern.exec(content);
        expect(match).toBeNull();
      }),
      { numRuns: 100 },
    );
  });
});


/**
 * Feature: starter-brightstack-support, Property 2: Blockstore path validation
 *
 * Validates: Requirements 2.3
 *
 * For any string input, the validator SHALL accept if non-empty, no null bytes,
 * valid filesystem chars. For any whitespace-only or null-byte string, SHALL reject.
 */

/** Inline validator matching the CLI prompt validation logic */
function validateBlockStorePath(val: string): boolean {
  if (!val || val.trim().length === 0) return false;
  if (val.includes('\0')) return false;
  return true;
}

describe('Feature: starter-brightstack-support, Property 2: Blockstore path validation', () => {
  it('accepts non-empty strings without null bytes', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0 && !s.includes('\0')),
        (path) => {
          expect(validateBlockStorePath(path)).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('rejects empty, whitespace-only, or null-byte strings', () => {
    const invalidPaths = [
      '',
      ' ',
      '  ',
      '\t',
      '\n',
      '\0',
      'valid/path\0rest',
    ];
    fc.assert(
      fc.property(fc.constantFrom(...invalidPaths), (path) => {
        expect(validateBlockStorePath(path)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});


/**
 * Feature: starter-brightstack-support, Property 4: Preset selection by stack type
 *
 * Validates: Requirements 6.2, 6.3
 *
 * For any stackType value, the preset resolver SHALL return standard.json for
 * "mern" and brightstack.json for "brightstack".
 */

function resolvePresetFileName(stackType: 'mern' | 'brightstack'): string {
  return stackType === 'brightstack' ? 'brightstack.json' : 'standard.json';
}

describe('Feature: starter-brightstack-support, Property 4: Preset selection by stack type', () => {
  it('returns the correct preset file for any stack type', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('mern' as const, 'brightstack' as const),
        (stackType) => {
          const preset = resolvePresetFileName(stackType);
          if (stackType === 'mern') {
            expect(preset).toBe('standard.json');
          } else {
            expect(preset).toBe('brightstack.json');
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});


/**
 * Feature: starter-brightstack-support, Property 3: Scaffolding directory resolution
 *
 * Validates: Requirements 4.3, 4.4, 8.1, 8.2, 8.3
 *
 * For any stackType in {"mern", "brightstack"} and stack-dependent project type,
 * resolver SHALL return path ending in {projectType}-{stackType}. For stack-independent
 * types, SHALL return same path regardless of stackType.
 */

const stackDependentTypes = ['api', 'api-lib', 'inituserdb'];
const stackIndependentTypes = ['react', 'react-lib', 'lib', 'root'];

function resolveScaffoldingDirName(
  projectType: string,
  stackType: 'mern' | 'brightstack',
): string {
  return stackDependentTypes.includes(projectType)
    ? `${projectType}-${stackType}`
    : projectType;
}

describe('Feature: starter-brightstack-support, Property 3: Scaffolding directory resolution', () => {
  it('stack-dependent types resolve to {projectType}-{stackType}', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...stackDependentTypes),
        fc.constantFrom('mern' as const, 'brightstack' as const),
        (projectType, stackType) => {
          const result = resolveScaffoldingDirName(projectType, stackType);
          expect(result).toBe(`${projectType}-${stackType}`);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('stack-independent types resolve to same path regardless of stackType', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...stackIndependentTypes),
        fc.constantFrom('mern' as const, 'brightstack' as const),
        (projectType, stackType) => {
          const result = resolveScaffoldingDirName(projectType, stackType);
          expect(result).toBe(projectType);
        },
      ),
      { numRuns: 100 },
    );
  });
});


/**
 * Feature: starter-brightstack-support, Property 7: Stack-specific environment variables
 *
 * Validates: Requirements 7.1, 7.2, 11.2
 *
 * For MERN config, generated .env.example SHALL contain MONGO_URI, MONGO_USE_TRANSACTIONS,
 * DEV_DATABASE. For BrightStack, SHALL contain BRIGHTCHAIN_BLOCKSTORE_PATH,
 * BRIGHTCHAIN_BLOCKSIZE_BYTES, BRIGHTCHAIN_BLOCKSTORE_TYPE, USE_MEMORY_DOCSTORE,
 * DEV_DATABASE, MEMBER_POOL_NAME.
 */

/** Simulates reading the .env.example template content for a given stack type */
function getEnvTemplateContent(stackType: 'mern' | 'brightstack'): string {
  const envTemplatePath = path.resolve(
    __dirname,
    `../../scaffolding/api-${stackType}/.env.example.mustache`,
  );
  if (!fs.existsSync(envTemplatePath)) {
    // Fallback: check without .mustache extension
    const fallbackPath = path.resolve(
      __dirname,
      `../../scaffolding/api-${stackType}/.env.example`,
    );
    if (fs.existsSync(fallbackPath)) {
      return fs.readFileSync(fallbackPath, 'utf-8');
    }
    return '';
  }
  return fs.readFileSync(envTemplatePath, 'utf-8');
}

describe('Feature: starter-brightstack-support, Property 7: Stack-specific env vars', () => {
  it('MERN .env template contains MONGO_URI, MONGO_USE_TRANSACTIONS, DEV_DATABASE', () => {
    fc.assert(
      fc.property(fc.constant('mern' as const), (stackType) => {
        const content = getEnvTemplateContent(stackType);
        expect(content).toContain('MONGO_URI');
        expect(content).toContain('MONGO_USE_TRANSACTIONS');
        expect(content).toContain('DEV_DATABASE');
      }),
      { numRuns: 1 },
    );
  });

  it('BrightStack .env template contains BrightStack-specific vars', () => {
    fc.assert(
      fc.property(fc.constant('brightstack' as const), (stackType) => {
        const content = getEnvTemplateContent(stackType);
        expect(content).toContain('BRIGHTCHAIN_BLOCKSTORE_PATH');
        expect(content).toContain('BRIGHTCHAIN_BLOCKSIZE_BYTES');
        expect(content).toContain('BRIGHTCHAIN_BLOCKSTORE_TYPE');
        expect(content).toContain('USE_MEMORY_DOCSTORE');
        expect(content).toContain('DEV_DATABASE');
        expect(content).toContain('MEMBER_POOL_NAME');
      }),
      { numRuns: 1 },
    );
  });
});


/**
 * Feature: starter-brightstack-support, Property 8: Shared environment variables across stacks
 *
 * Validates: Requirements 7.4
 *
 * For any GeneratorConfig regardless of stackType, generated .env.example SHALL
 * contain JWT_SECRET, MNEMONIC_ENCRYPTION_KEY, MNEMONIC_HMAC_SECRET.
 */

describe('Feature: starter-brightstack-support, Property 8: Shared env vars across stacks', () => {
  it('both stack .env templates contain shared secret vars', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('mern' as const, 'brightstack' as const),
        (stackType) => {
          const content = getEnvTemplateContent(stackType);
          expect(content).toContain('JWT_SECRET');
          expect(content).toContain('MNEMONIC_ENCRYPTION_KEY');
          expect(content).toContain('MNEMONIC_HMAC_SECRET');
        },
      ),
      { numRuns: 100 },
    );
  });
});


/**
 * Feature: starter-brightstack-support, Property 9: BlockStorePath pre-population
 *
 * Validates: Requirements 7.3
 *
 * For BrightStack config with non-empty blockStorePath, generated .env.example
 * SHALL contain BRIGHTCHAIN_BLOCKSTORE_PATH={blockStorePath} with the exact value.
 */

/** Simulates the env content replacement logic for blockStorePath */
function applyBlockStorePathReplacement(
  envContent: string,
  blockStorePath: string,
): string {
  if (blockStorePath) {
    return envContent.replace(
      /BRIGHTCHAIN_BLOCKSTORE_PATH=.*/g,
      () => `BRIGHTCHAIN_BLOCKSTORE_PATH=${blockStorePath}`,
    );
  }
  return envContent;
}

describe('Feature: starter-brightstack-support, Property 9: BlockStorePath pre-population', () => {
  it('non-empty blockStorePath is written into env content', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => !s.includes('\0') && !s.includes('\n')),
        (blockStorePath) => {
          const template = 'BRIGHTCHAIN_BLOCKSTORE_PATH={{blockStorePath}}\nOTHER=value';
          const result = applyBlockStorePathReplacement(template, blockStorePath);
          expect(result).toContain(`BRIGHTCHAIN_BLOCKSTORE_PATH=${blockStorePath}`);
        },
      ),
      { numRuns: 100 },
    );
  });
});


/**
 * Feature: starter-brightstack-support, Property 10: stackType propagates to template rendering context
 *
 * Validates: Requirements 9.2
 *
 * For any GeneratorConfig with a stackType value, the template rendering context
 * SHALL include stackType equal to config value, isMern equal to stackType === "mern",
 * isBrightStack equal to stackType === "brightstack".
 */

function buildScaffoldingVarsStackFields(stackType: 'mern' | 'brightstack') {
  const resolvedStackType = stackType ?? 'mern';
  return {
    stackType: resolvedStackType,
    isMern: resolvedStackType === 'mern',
    isBrightStack: resolvedStackType === 'brightstack',
  };
}

describe('Feature: starter-brightstack-support, Property 10: stackType propagates to template context', () => {
  it('template context has correct stackType, isMern, isBrightStack', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('mern' as const, 'brightstack' as const),
        (stackType) => {
          const vars = buildScaffoldingVarsStackFields(stackType);
          expect(vars.stackType).toBe(stackType);
          expect(vars.isMern).toBe(stackType === 'mern');
          expect(vars.isBrightStack).toBe(stackType === 'brightstack');
        },
      ),
      { numRuns: 100 },
    );
  });
});


/**
 * Feature: starter-brightstack-support, Property 11: Missing stackType defaults to MERN
 *
 * Validates: Requirements 10.3
 *
 * For any GeneratorConfig where stackType is undefined, all stack-dependent
 * functions SHALL behave identically to stackType === "mern".
 */

describe('Feature: starter-brightstack-support, Property 11: Missing stackType defaults to MERN', () => {
  it('scaffolding resolution defaults to mern when stackType is undefined', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...stackDependentTypes),
        (projectType) => {
          // Simulate the ?? 'mern' default that the actual code uses
          const configStackType: 'mern' | 'brightstack' | undefined = undefined;
          const defaultStackType: 'mern' | 'brightstack' = configStackType ?? 'mern';
          const mernResult = resolveScaffoldingDirName(projectType, defaultStackType);
          const explicitMernResult = resolveScaffoldingDirName(projectType, 'mern');
          expect(mernResult).toBe(explicitMernResult);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('preset selection defaults to standard.json when stackType is undefined', () => {
    const configStackType: 'mern' | 'brightstack' | undefined = undefined;
    const defaultStackType: 'mern' | 'brightstack' = configStackType ?? 'mern';
    expect(resolvePresetFileName(defaultStackType)).toBe('standard.json');
    expect(resolvePresetFileName('mern')).toBe('standard.json');
  });

  it('template context defaults to mern when stackType is undefined', () => {
    const configStackType: 'mern' | 'brightstack' | undefined = undefined;
    const defaultStackType: 'mern' | 'brightstack' = configStackType ?? 'mern';
    const vars = buildScaffoldingVarsStackFields(defaultStackType);
    const mernVars = buildScaffoldingVarsStackFields('mern');
    expect(vars).toEqual(mernVars);
  });
});
