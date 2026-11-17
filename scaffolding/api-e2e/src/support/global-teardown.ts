const STOP_TIMEOUT_MS = 10_000;

/** Stops the API that global-setup started, including any child processes. */
export default async function globalTeardown(): Promise<void> {
  const server = globalThis.__E2E_SERVER__;
  globalThis.__E2E_SERVER__ = undefined;
  if (!server?.pid || server.exitCode !== null || server.signalCode !== null) {
    return;
  }
  const pid = server.pid;
  const exited = new Promise<void>((resolve) => {
    server.once('exit', () => resolve());
  });
  try {
    process.kill(-pid, 'SIGTERM');
  } catch {
    return; // The process group is already gone.
  }
  const timer = new Promise<'timeout'>((resolve) =>
    setTimeout(() => resolve('timeout'), STOP_TIMEOUT_MS).unref(),
  );
  if ((await Promise.race([exited, timer])) === 'timeout') {
    try {
      process.kill(-pid, 'SIGKILL');
    } catch {
      // Already gone.
    }
  }
  console.log('\nStopped the e2e API.\n');
}
