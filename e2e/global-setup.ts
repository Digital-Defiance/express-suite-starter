import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as http from 'http';
import { execSync, spawn } from 'child_process';
import {
  generateMonorepo,
  GeneratorConfig,
  ProjectConfigBuilder,
} from '../src/index';
import { writeState } from './e2e-shared-state';

const WORKSPACE_NAME = 'e2e-test-app';
const NAMESPACE = `@${WORKSPACE_NAME}`;
const DEV_DATABASE_NAME = 'e2e_test';
const YARN_INSTALL_TIMEOUT_MS = 300_000;
const BUILD_TIMEOUT_MS = 300_000;
const SERVER_POLL_TIMEOUT_MS = 120_000;
const SERVER_POLL_INTERVAL_MS = 2_000;

function getRandomPort(): number {
  return Math.floor(Math.random() * 50_000) + 10_000;
}

function waitForServer(url: string, timeoutMs: number, intervalMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;

    const poll = () => {
      if (Date.now() > deadline) {
        reject(new Error(`Server did not respond at ${url} within ${timeoutMs}ms`));
        return;
      }

      http
        .get(url, (res) => {
          // Any response means the server is up
          res.resume();
          resolve();
        })
        .on('error', () => {
          setTimeout(poll, intervalMs);
        });
    };

    poll();
  });
}

export default async function globalSetup(): Promise<void> {
  // Step 1: Create a unique temp directory
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'starter-e2e-'));
  const projectDir = path.join(tmpDir, WORKSPACE_NAME);

  console.log(`[e2e-setup] Temp directory: ${tmpDir}`);

  try {
    // Step 2: Build GeneratorConfig
    const config: GeneratorConfig = {
      workspace: {
        name: WORKSPACE_NAME,
        prefix: WORKSPACE_NAME,
        namespace: NAMESPACE,
        parentDir: tmpDir,
      },
      projects: ProjectConfigBuilder.build(WORKSPACE_NAME, NAMESPACE, {
        includeReactLib: true,
        includeApiLib: true,
        includeInitUserDb: true,
        includeE2e: false,
      }),
      packages: {
        dev: [
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
          '@types/cors',
          '@types/express',
          '@types/jsonwebtoken',
          '@types/node',
          '@types/react',
          '@types/react-dom',
        ],
        prod: [
          '@aws-sdk/client-ses',
          '@digitaldefiance/node-express-suite@latest',
          '@digitaldefiance/ecies-lib@latest',
          '@digitaldefiance/node-ecies-lib@latest',
          '@digitaldefiance/i18n-lib@latest',
          '@digitaldefiance/suite-core-lib@latest',
          '@digitaldefiance/mongoose-types@latest',
          '@digitaldefiance/express-suite-react-components@latest',
          '@digitaldefiance/branded-interface@latest',
          '@digitaldefiance/branded-enum@latest',
          '@digitaldefiance/reed-solomon-erasure.wasm@latest',
          '@emotion/react',
          '@emotion/styled',
          '@mui/icons-material',
          '@mui/material',
          '@mui/system',
          '@mui/x-date-pickers',
          'argon2',
          'axios',
          'bip39',
          'cors',
          'date-fns',
          'dotenv',
          'ejs',
          'express',
          'express-validator',
          'helmet',
          'jsonwebtoken',
          'mongodb',
          'mongoose',
          'react-router-dom',
          'reflect-metadata',
          'sass',
          'ts-brand',
          'zod',
        ],
      },
      templates: { engine: 'mustache' },
      nx: {
        linter: 'eslint',
        unitTestRunner: 'jest',
        e2eTestRunner: 'playwright',
        style: 'css',
        bundler: 'vite',
        ciProvider: 'github',
      },
      node: {
        version: '20.11.0',
        yarnVersion: '4.11.0',
      },
    };

    // Step 3: Generate the monorepo
    console.log('[e2e-setup] Generating monorepo...');
    await generateMonorepo({
      config,
      inMemoryDb: { enabled: true, databaseName: DEV_DATABASE_NAME },
      skipSystemCheck: true,
      createInitialCommit: false,
      installPlaywright: false,
      devcontainer: { type: 'none' },
    });
    console.log('[e2e-setup] Monorepo generated.');

    // Step 4: Install dependencies
    console.log('[e2e-setup] Running yarn install...');
    execSync('yarn install', {
      cwd: projectDir,
      stdio: 'inherit',
      timeout: YARN_INSTALL_TIMEOUT_MS,
    });
    console.log('[e2e-setup] Dependencies installed.');

    // Derive project names from the config
    const apiName = `${WORKSPACE_NAME}-api`;
    const reactName = `${WORKSPACE_NAME}-react`;

    // Step 5: Build API and React projects
    console.log('[e2e-setup] Building API project...');
    execSync(`npx nx run ${apiName}:build`, {
      cwd: projectDir,
      stdio: 'inherit',
      timeout: BUILD_TIMEOUT_MS,
    });

    console.log('[e2e-setup] Building React project...');
    execSync(`npx nx run ${reactName}:build`, {
      cwd: projectDir,
      stdio: 'inherit',
      timeout: BUILD_TIMEOUT_MS,
    });
    console.log('[e2e-setup] Builds complete.');

    // Step 6: Patch the .env file
    const port = getRandomPort();
    const apiDistDir = path.join(projectDir, 'dist', apiName);
    const reactDistDir = path.join(projectDir, 'dist', reactName);
    const envPath = path.join(projectDir, apiName, '.env');

    let envContent = fs.readFileSync(envPath, 'utf-8');
    envContent = envContent.replace(/DEV_DATABASE=.*/g, `DEV_DATABASE=${DEV_DATABASE_NAME}`);
    envContent = envContent.replace(/API_DIST_DIR=.*/g, `API_DIST_DIR=${apiDistDir}`);
    envContent = envContent.replace(/REACT_DIST_DIR=.*/g, `REACT_DIST_DIR=${reactDistDir}`);

    // Add PORT if not already present, otherwise replace it
    if (/^PORT=.*/m.test(envContent)) {
      envContent = envContent.replace(/^PORT=.*/gm, `PORT=${port}`);
    } else {
      envContent = `PORT=${port}\n${envContent}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log(`[e2e-setup] Patched .env with PORT=${port}`);

    // Step 7: Copy patched .env to the API dist directory
    fs.copyFileSync(envPath, path.join(apiDistDir, '.env'));
    console.log('[e2e-setup] Copied .env to API dist directory.');

    // Step 8: Spawn the Express server
    // The generated main.ts resolves .env via join(process.cwd(), 'dist', '<prefix>-api', '.env'),
    // so the server must run with cwd set to the workspace root (projectDir), not the dist dir.
    console.log('[e2e-setup] Starting Express server...');

    // Capture stdout to extract admin mnemonic from DatabaseInitializationService output
    let serverOutput = '';
    const serverProcess = spawn('node', [path.join('dist', apiName, 'main.js')], {
      cwd: projectDir,
      env: { ...process.env, DEV_DATABASE: DEV_DATABASE_NAME },
      stdio: 'pipe',
      detached: true,
    });

    serverProcess.stdout.on('data', (data: Buffer) => {
      const text = data.toString();
      serverOutput += text;
      console.log(`[e2e-server] ${text.trim()}`);
    });

    serverProcess.stderr.on('data', (data: Buffer) => {
      console.error(`[e2e-server:err] ${data.toString().trim()}`);
    });

    serverProcess.unref();

    // Step 9: Poll until the server responds
    const baseURL = `http://localhost:${port}`;
    console.log(`[e2e-setup] Waiting for server at ${baseURL}...`);
    await waitForServer(baseURL, SERVER_POLL_TIMEOUT_MS, SERVER_POLL_INTERVAL_MS);
    console.log('[e2e-setup] Server is ready.');

    // Step 10: Write shared state
    // Parse admin mnemonic from server init output
    // The server prints: "Admin Mnemonic: <mnemonic words>" during DatabaseInitializationService.printServerInitResults
    const adminMnemonicMatch = serverOutput.match(/Admin Mnemonic:\s*(.+)/i);
    const adminMnemonic = adminMnemonicMatch ? adminMnemonicMatch[1].trim() : '';
    if (!adminMnemonic) {
      console.warn('[e2e-setup] WARNING: Could not parse admin mnemonic from server output');
    } else {
      console.log('[e2e-setup] Admin mnemonic captured from server init output.');
    }

    writeState({
      projectDir,
      tmpDir,
      port,
      serverPid: serverProcess.pid!,
      baseURL,
      workspaceName: WORKSPACE_NAME,
      prefix: WORKSPACE_NAME,
      adminMnemonic,
      adminUsername: 'admin',
    });
    console.log('[e2e-setup] Shared state written. Setup complete.');
  } catch (error) {
    // Cleanup on failure
    console.error('[e2e-setup] Setup failed, cleaning up...');
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
    throw error;
  }
}
