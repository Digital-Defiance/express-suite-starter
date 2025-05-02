#!/usr/bin/env ts-node
/**
 * Template Synchronization Tool
 * 
 * Syncs templates from a reference project to the template directory.
 * Replaces project-specific values with Mustache variables.
 */

import * as fs from 'fs';
import * as path from 'path';
import { confirm, input } from '@inquirer/prompts';

interface SyncConfig {
  sourceDir: string;
  templateDir: string;
  replacements: Record<string, string>;
  excludePatterns: string[];
}

const DEFAULT_REPLACEMENTS: Record<string, string> = {
  'digital-burnbag': '{{workspaceName}}',
  'DigitalBurnbag': '{{WorkspaceName}}',
  'digitalBurnbag': '{{workspaceNameCamel}}',
  'DIGITAL_BURNBAG': '{{WORKSPACE_NAME}}',
  '@digitaldefiance': '{{namespace}}',
  'digitaldefiance': '{{namespaceShort}}',
};

const DEFAULT_EXCLUDES = [
  'node_modules',
  'dist',
  'build',
  '.nx',
  'coverage',
  '.git',
  '*.log',
  'yarn.lock',
  'package-lock.json',
];

async function syncTemplates(config: SyncConfig): Promise<void> {
  console.log(`\n📦 Syncing templates from ${config.sourceDir}`);
  console.log(`📁 Target: ${config.templateDir}\n`);

  const files = walkDirectory(config.sourceDir, config.excludePatterns);
  
  for (const file of files) {
    const relativePath = path.relative(config.sourceDir, file);
    const targetPath = path.join(config.templateDir, relativePath + '.mustache');
    
    let content = fs.readFileSync(file, 'utf-8');
    
    for (const [search, replace] of Object.entries(config.replacements)) {
      content = content.replace(new RegExp(search, 'g'), replace);
    }
    
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, content, 'utf-8');
    
    console.log(`✓ ${relativePath}`);
  }
  
  console.log(`\n✅ Synced ${files.length} files\n`);
}

function walkDirectory(dir: string, excludePatterns: string[]): string[] {
  const files: string[] = [];
  
  function walk(currentDir: string): void {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (shouldExclude(entry.name, excludePatterns)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

function shouldExclude(name: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(name);
    }
    return name === pattern;
  });
}

async function main(): Promise<void> {
  console.log('🔄 Template Synchronization Tool\n');
  
  const sourceDir = await input({
    message: 'Source project directory:',
    default: '../digitaldefiance-express-suite-example',
  });
  
  const templateDir = await input({
    message: 'Template output directory:',
    default: './templates',
  });
  
  const useDefaults = await confirm({
    message: 'Use default replacements and exclusions?',
    default: true,
  });
  
  const config: SyncConfig = {
    sourceDir,
    templateDir,
    replacements: DEFAULT_REPLACEMENTS,
    excludePatterns: DEFAULT_EXCLUDES,
  };
  
  if (!useDefaults) {
    console.log('\n⚠️  Custom configuration not yet implemented. Using defaults.\n');
  }
  
  const proceed = await confirm({
    message: `Sync templates from ${sourceDir}?`,
    default: false,
  });
  
  if (!proceed) {
    console.log('❌ Cancelled\n');
    return;
  }
  
  await syncTemplates(config);
}

if (require.main === module) {
  main().catch(console.error);
}

export { syncTemplates, SyncConfig };
