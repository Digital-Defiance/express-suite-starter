import * as fs from 'fs';
import { readState, getStatePath } from './e2e-shared-state';

/**
 * Waits for the specified duration in milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Checks whether a process with the given PID is still running.
 */
function isProcessAlive(pid: number): boolean {
  try {
    // Sending signal 0 does not kill the process; it checks existence.
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/**
 * Playwright globalTeardown function.
 * Cleans up the Express server process and removes the temporary project directory.
 */
export default async function globalTeardown(): Promise<void> {
  const state = readState();
  if (!state) {
    return;
  }

  const { serverPid, projectDir, tmpDir } = state;

  // Attempt graceful shutdown
  try {
    process.kill(serverPid, 'SIGTERM');
  } catch {
    // Process may already be dead — ignore
  }

  // Wait briefly, then force-kill if still alive
  await sleep(2000);

  if (isProcessAlive(serverPid)) {
    try {
      process.kill(serverPid, 'SIGKILL');
    } catch {
      // Ignore — best-effort cleanup
    }
  }

  // Remove the parent temp directory (which contains projectDir)
  const dirToRemove = tmpDir || projectDir;
  fs.rmSync(dirToRemove, { recursive: true, force: true });

  // Remove the shared state file
  const statePath = getStatePath();
  fs.rmSync(statePath, { force: true });
}
