#!/usr/bin/env node
/**
 * CLI entry point for npx execution
 */

import { main } from './generate-monorepo';

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
