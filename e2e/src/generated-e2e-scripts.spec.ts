import { test, expect } from '@playwright/test';
import { spawn } from 'child_process';
import { readState } from '../e2e-shared-state';

/**
 * Runs the e2e scripts that ship inside the generated workspaces
 * (yarn test:e2e and yarn test:e2e:web). Ordering: the playwright config puts
 * this file in its own project that depends on the main project, so it runs
 * after the harness specs (the web script rebuilds dist/ and must not disturb
 * them).
 */

const SCRIPT_TIMEOUT_MS = 900_000;
const OUTPUT_TAIL_CHARS = 6_000;

interface IScriptResult {
  code: number | null;
  output: string;
}

function randomPort(): number {
  return Math.floor(Math.random() * 10_000) + 40_000;
}

function runYarn(cwd: string, args: string[], port: number): Promise<IScriptResult> {
  return new Promise((resolve, reject) => {
    const child = spawn('yarn', args, {
      cwd,
      env: {
        ...process.env,
        // Separate port from the harness server (generated react-e2e reads it)
        E2E_WEB_PORT: String(port),
        NX_DAEMON: 'false',
        NX_TUI: 'false',
        CI: '',
      },
      stdio: 'pipe',
    });
    let output = '';
    child.stdout.on('data', (d: Buffer) => (output += d.toString()));
    child.stderr.on('data', (d: Buffer) => (output += d.toString()));
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, output }));
  });
}

function expectSuccess(result: IScriptResult, label: string): void {
  expect(
    result.code,
    `${label} exited with ${result.code}. Output tail:\n${result.output.slice(-OUTPUT_TAIL_CHARS)}`,
  ).toBe(0);
}

const stacks: { label: string; dir: (s: NonNullable<ReturnType<typeof readState>>) => string | undefined }[] = [
  { label: 'MERN', dir: (s) => s.projectDir },
  { label: 'BrightStack', dir: (s) => s.brightstack?.projectDir },
];

for (const stack of stacks) {
  test.describe(`Generated e2e scripts (${stack.label})`, () => {
    test.setTimeout(SCRIPT_TIMEOUT_MS);

    test('yarn test:e2e passes', async () => {
      const state = readState();
      if (!state) throw new Error('E2E shared state not found');
      const dir = stack.dir(state);
      test.skip(!dir, 'BrightStack disabled with E2E_BRIGHTSTACK=false');
      if (!dir) return;
      expectSuccess(await runYarn(dir, ['test:e2e'], randomPort()), 'yarn test:e2e');
    });

    test('yarn test:e2e:web --project=chromium passes', async () => {
      const state = readState();
      if (!state) throw new Error('E2E shared state not found');
      const dir = stack.dir(state);
      test.skip(!dir, 'BrightStack disabled with E2E_BRIGHTSTACK=false');
      if (!dir) return;
      expectSuccess(
        await runYarn(dir, ['test:e2e:web', '--project=chromium'], randomPort()),
        'yarn test:e2e:web --project=chromium',
      );
    });
  });
}
