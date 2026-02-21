import * as fs from 'fs';
import * as path from 'path';

/**
 * Shared state written by global setup and consumed by test specs and global teardown.
 */
export interface E2ESharedState {
  /** Absolute path to the generated monorepo */
  projectDir: string;
  /** Absolute path to the parent temp directory (contains projectDir) */
  tmpDir: string;
  /** Port the Express server is listening on */
  port: number;
  /** PID of the Express server child process */
  serverPid: number;
  /** Base URL for Playwright (e.g., http://localhost:PORT) */
  baseURL: string;
  /** Name of the generated workspace */
  workspaceName: string;
  /** Prefix used for generated project names */
  prefix: string;
  /** Admin mnemonic phrase captured from server init output */
  adminMnemonic: string;
  /** Admin username (default: 'admin') */
  adminUsername: string;
}

/**
 * Returns the deterministic path to the shared state JSON file.
 * Located at `e2e/.e2e-state.json` relative to the starter package directory.
 */
export function getStatePath(): string {
  return path.resolve(__dirname, '.e2e-state.json');
}

/**
 * Writes the shared E2E state to disk so test specs and teardown can read it.
 */
export function writeState(state: E2ESharedState): void {
  fs.writeFileSync(getStatePath(), JSON.stringify(state, null, 2), 'utf-8');
}

/**
 * Reads the shared E2E state from disk.
 * Returns `null` if the state file does not exist.
 */
export function readState(): E2ESharedState | null {
  const statePath = getStatePath();
  if (!fs.existsSync(statePath)) {
    return null;
  }
  const raw = fs.readFileSync(statePath, 'utf-8');
  return JSON.parse(raw) as E2ESharedState;
}
