export interface CommandOptions {
  cwd?: string;
  silent?: boolean;
  dryRun?: boolean;
  env?: NodeJS.ProcessEnv;
}
