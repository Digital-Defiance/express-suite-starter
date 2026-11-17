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
import { writeState, E2ESharedState } from './e2e-shared-state';

/** Subset of config/presets/*.json that the harness feeds to the generator. */
type PresetConfig = Pick<
  GeneratorConfig,
  'packages' | 'templates' | 'nx' | 'node'
>;

function loadPreset(name: 'standard' | 'brightstack'): PresetConfig {
  const file = path.resolve(__dirname, '../config/presets', name + '.json');
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as PresetConfig;
}

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
  // Disable Yarn's package minimum-age gate for all yarn invocations during
  // generation and install. The e2e must verify the just-published suite
  // packages, but Yarn (4.18+) defaults to a 24h cooldown and would otherwise
  // silently resolve the previous major (e.g. 4.28.3 instead of 5.x) until the
  // new release ages. This only affects the throwaway e2e workspace, not the
  // generator's output or real users.
  process.env.YARN_NPM_MINIMAL_AGE_GATE = '0';
  // Native modules (e.g. bcrypt in the BrightStack stack) must run build
  // scripts to compile their bindings. Yarn enables "hardened mode" when it
  // detects CI, which force-disables build scripts and ignores
  // YARN_ENABLE_SCRIPTS. Clearing CI for this setup process (and enabling
  // scripts) lets those bindings compile so the generated server can start.
  delete process.env.CI;
  process.env.YARN_ENABLE_SCRIPTS = '1';
  process.env.YARN_ENABLE_HARDENED_MODE = '0';

  const mernPreset = loadPreset('standard');
  const bsPreset = loadPreset('brightstack');

  // Step 1: Create a unique temp directory
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'starter-e2e-'));
  const projectDir = path.join(tmpDir, WORKSPACE_NAME);

  // Detached servers started so far; killed if setup fails, because
  // Playwright does not run globalTeardown after a failed globalSetup.
  const spawnedPids: number[] = [];

  console.log(`[e2e-setup] Temp directory: ${tmpDir}`);

  try {
    // Step 2: Build GeneratorConfig
    const config: GeneratorConfig = {
      stackType: 'mern',
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
        includeE2e: true,
      }),
      packages: mernPreset.packages,
      templates: mernPreset.templates,
      nx: mernPreset.nx,
      node: mernPreset.node,
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

    // Enable TOTP feature flag so the UI renders TOTP controls
    if (/^TOTP_AVAILABLE=.*/m.test(envContent)) {
      envContent = envContent.replace(/^TOTP_AVAILABLE=.*/gm, 'TOTP_AVAILABLE=true');
    } else {
      envContent += '\nTOTP_AVAILABLE=true\n';
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
    if (serverProcess.pid) spawnedPids.push(serverProcess.pid);

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

    // ─── BrightStack workspace generation (optional) ─────────────────────
    let brightstack: E2ESharedState['brightstack'] = undefined;

    const enableBrightStack = process.env.E2E_BRIGHTSTACK !== 'false';
    if (enableBrightStack) {
      console.log('[e2e-setup] Generating BrightStack workspace...');
      const bsTmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'starter-e2e-bs-'));
      const bsWorkspaceName = 'e2e-bs-app';
      const bsNamespace = `@${bsWorkspaceName}`;
      const bsProjectDir = path.join(bsTmpDir, bsWorkspaceName);

      try {
        const bsConfig: GeneratorConfig = {
          workspace: {
            name: bsWorkspaceName,
            prefix: bsWorkspaceName,
            namespace: bsNamespace,
            parentDir: bsTmpDir,
          },
          stackType: 'brightstack',
          projects: ProjectConfigBuilder.build(bsWorkspaceName, bsNamespace, {
            includeReactLib: true,
            includeApiLib: true,
            includeInitUserDb: true,
            includeE2e: true,
          }),
          packages: bsPreset.packages,
          templates: bsPreset.templates,
          nx: bsPreset.nx,
          node: bsPreset.node,
        };

        await generateMonorepo({
          config: bsConfig,
          inMemoryDb: { enabled: true, databaseName: 'e2e_bs_test' },
          skipSystemCheck: true,
          createInitialCommit: false,
          installPlaywright: false,
          devcontainer: { type: 'none' },
        });
        console.log('[e2e-setup] BrightStack monorepo generated.');

        console.log('[e2e-setup] Running yarn install for BrightStack...');
        execSync('yarn install', {
          cwd: bsProjectDir,
          stdio: 'inherit',
          timeout: YARN_INSTALL_TIMEOUT_MS,
        });

        // Workaround for an upstream defect, still open: the published
        // @brightchain/brightchain-lib package.json does not export the
        // ./lib/db/* subpaths (cursor, updateEngine, transaction,
        // inMemoryHeadRegistry, indexing) that @brightchain/db imports, so the
        // BrightStack API fails to build or start without this patch. It has to
        // be fixed in the BrightChain packages; the starter cannot fix it.
        console.log('[e2e-setup] Patching @brightchain/brightchain-lib exports...');
        const bclPkgPath = path.join(bsProjectDir, 'node_modules', '@brightchain', 'brightchain-lib', 'package.json');
        if (fs.existsSync(bclPkgPath)) {
          const bclPkg = JSON.parse(fs.readFileSync(bclPkgPath, 'utf-8'));
          const subpaths = ['cursor', 'updateEngine', 'transaction', 'inMemoryHeadRegistry', 'indexing'];
          for (const mod of subpaths) {
            const key = `./lib/db/${mod}`;
            if (!bclPkg.exports?.[key]) {
              bclPkg.exports = bclPkg.exports || {};
              bclPkg.exports[key] = {
                types: `./src/lib/db/${mod}.d.ts`,
                import: `./src/lib/db/${mod}.js`,
                require: `./src/lib/db/${mod}.js`,
              };
            }
          }
          fs.writeFileSync(bclPkgPath, JSON.stringify(bclPkg, null, 2));
          console.log('[e2e-setup] Patched brightchain-lib exports for subpath imports.');
        }

        const bsApiName = `${bsWorkspaceName}-api`;
        const bsReactName = `${bsWorkspaceName}-react`;

        console.log('[e2e-setup] Building BrightStack API...');
        execSync(`npx nx run ${bsApiName}:build`, {
          cwd: bsProjectDir,
          stdio: 'inherit',
          timeout: BUILD_TIMEOUT_MS,
        });

        console.log('[e2e-setup] Building BrightStack React...');
        execSync(`npx nx run ${bsReactName}:build`, {
          cwd: bsProjectDir,
          stdio: 'inherit',
          timeout: BUILD_TIMEOUT_MS,
        });

        const bsPort = getRandomPort();
        const bsApiDistDir = path.join(bsProjectDir, 'dist', bsApiName);
        const bsReactDistDir = path.join(bsProjectDir, 'dist', bsReactName);
        const bsEnvPath = path.join(bsProjectDir, bsApiName, '.env');

        let bsEnvContent = fs.readFileSync(bsEnvPath, 'utf-8');
        bsEnvContent = bsEnvContent.replace(/DEV_DATABASE=.*/g, `DEV_DATABASE=e2e_bs_test`);
        bsEnvContent = bsEnvContent.replace(/API_DIST_DIR=.*/g, `API_DIST_DIR=${bsApiDistDir}`);
        bsEnvContent = bsEnvContent.replace(/REACT_DIST_DIR=.*/g, `REACT_DIST_DIR=${bsReactDistDir}`);
        if (/^PORT=.*/m.test(bsEnvContent)) {
          bsEnvContent = bsEnvContent.replace(/^PORT=.*/gm, `PORT=${bsPort}`);
        } else {
          bsEnvContent = `PORT=${bsPort}\n${bsEnvContent}`;
        }
        fs.writeFileSync(bsEnvPath, bsEnvContent);
        fs.copyFileSync(bsEnvPath, path.join(bsApiDistDir, '.env'));

        console.log(`[e2e-setup] Starting BrightStack server on port ${bsPort}...`);
        let bsServerOutput = '';
        const bsServerProcess = spawn('node', [path.join('dist', bsApiName, 'main.js')], {
          cwd: bsProjectDir,
          env: { ...process.env, DEV_DATABASE: 'e2e_bs_test' },
          stdio: 'pipe',
          detached: true,
        });

        bsServerProcess.stdout.on('data', (data: Buffer) => {
          const text = data.toString();
          bsServerOutput += text;
          console.log(`[e2e-bs-server] ${text.trim()}`);
        });
        bsServerProcess.stderr.on('data', (data: Buffer) => {
          console.error(`[e2e-bs-server:err] ${data.toString().trim()}`);
        });
        bsServerProcess.unref();
        if (bsServerProcess.pid) spawnedPids.push(bsServerProcess.pid);

        const bsBaseURL = `http://localhost:${bsPort}`;
        console.log(`[e2e-setup] Waiting for BrightStack server at ${bsBaseURL}...`);
        await waitForServer(bsBaseURL, SERVER_POLL_TIMEOUT_MS, SERVER_POLL_INTERVAL_MS);
        console.log('[e2e-setup] BrightStack server is ready.');

        const bsAdminMnemonicMatch = bsServerOutput.match(/Admin Mnemonic:\s*(.+)/i);
        const bsAdminMnemonic = bsAdminMnemonicMatch ? bsAdminMnemonicMatch[1].trim() : '';

        brightstack = {
          projectDir: bsProjectDir,
          tmpDir: bsTmpDir,
          port: bsPort,
          serverPid: bsServerProcess.pid!,
          baseURL: bsBaseURL,
          workspaceName: bsWorkspaceName,
          prefix: bsWorkspaceName,
          adminMnemonic: bsAdminMnemonic,
          adminUsername: 'admin',
        };
      } catch (bsError) {
        // A broken BrightStack generation must fail the run. It is only
        // skipped when the caller opted out with E2E_BRIGHTSTACK=false.
        try {
          fs.rmSync(bsTmpDir, { recursive: true, force: true });
        } catch {
          // Ignore cleanup errors
        }
        throw bsError;
      }
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
      brightstack,
    });
    console.log('[e2e-setup] Shared state written. Setup complete.');
  } catch (error) {
    // Cleanup on failure
    console.error('[e2e-setup] Setup failed, cleaning up...');
    for (const pid of spawnedPids) {
      try {
        process.kill(pid, 'SIGKILL');
      } catch {
        // Process may already be dead
      }
    }
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
    throw error;
  }
}
