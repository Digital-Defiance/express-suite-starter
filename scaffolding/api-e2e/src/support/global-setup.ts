import { spawn, type ChildProcess } from 'child_process';
import * as http from 'http';
import * as net from 'net';
import * as path from 'path';
import { API_NAME, prepareE2eServer } from './e2e-env';

declare global {
  // eslint-disable-next-line no-var -- ambient global declarations require var
  var __E2E_SERVER__: ChildProcess | undefined;
}

const START_TIMEOUT_MS = 120_000;
const POLL_INTERVAL_MS = 500;
const OUTPUT_TAIL_CHARS = 4_000;

/** The workspace root, three levels above <project>/src/support. */
const WORKSPACE_ROOT = path.resolve(__dirname, '..', '..', '..');

/** Ask the OS for a free TCP port. */
function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => {
        if (address && typeof address === 'object') {
          resolve(address.port);
        } else {
          reject(new Error('Could not determine a free port'));
        }
      });
    });
  });
}

/** One health probe; resolves true on HTTP 200. */
function probeHealth(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2_000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Starts the built API on a free port; stopped again by global-teardown. */
export default async function globalSetup(): Promise<void> {
  const port = await getFreePort();
  const entry = prepareE2eServer(WORKSPACE_ROOT, port);
  const baseURL = `http://127.0.0.1:${port}`;
  console.log(`\nStarting ${API_NAME} for e2e on ${baseURL}\n`);

  let output = '';
  const server = spawn(process.execPath, [entry], {
    cwd: WORKSPACE_ROOT,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    // Own process group, so teardown can stop the server and its children.
    detached: true,
  });
  const capture = (chunk: Buffer): void => {
    output = (output + chunk.toString()).slice(-OUTPUT_TAIL_CHARS);
  };
  server.stdout?.on('data', capture);
  server.stderr?.on('data', capture);
  let exitCode: number | null | undefined;
  server.on('exit', (code) => {
    exitCode = code;
  });
  function killServer(): void {
    if (server.pid && exitCode === undefined) {
      try {
        process.kill(-server.pid, 'SIGKILL');
      } catch {
        // Already gone.
      }
    }
  }
  globalThis.__E2E_SERVER__ = server;
  // Never leave the server running if jest dies before teardown.
  process.on('exit', () => killServer());

  const deadline = Date.now() + START_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (exitCode !== undefined) {
      throw new Error(
        `The API exited early with code ${exitCode}. Last output:\n${output}`,
      );
    }
    if (await probeHealth(`${baseURL}/api/health`)) {
      process.env['E2E_BASE_URL'] = baseURL;
      console.log('API is ready.\n');
      return;
    }
    await sleep(POLL_INTERVAL_MS);
  }
  killServer();
  throw new Error(
    `The API did not answer ${baseURL}/api/health within ${START_TIMEOUT_MS} ms. Last output:\n${output}`,
  );
}
