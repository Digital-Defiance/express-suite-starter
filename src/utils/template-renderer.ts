import * as fs from 'fs';
import * as path from 'path';
import { createEngine } from '../templates';
import { setPerms } from './shell-utils';
import { Logger } from '../cli/logger';

export function renderTemplates(
  templatesDir: string,
  destDir: string,
  variables: Record<string, any>,
  engineType: 'mustache' | 'handlebars' = 'mustache'
): void {
  if (!fs.existsSync(templatesDir)) return;

  const engine = createEngine(engineType);

  function renderDir(srcDir: string, outDir: string): void {
    if (!fs.existsSync(srcDir)) return;
    const entries = fs.readdirSync(srcDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(srcDir, entry.name);
      const destPath = path.join(outDir, entry.name.replace(/\\.mustache$/, ''));
      
      if (entry.isDirectory()) {
        renderDir(srcPath, destPath);
      } else if (entry.isFile()) {
        const template = fs.readFileSync(srcPath, 'utf8');
        const rendered = engine.render(template, variables);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.writeFileSync(destPath, rendered, 'utf8');
        setPerms(destPath);
        Logger.dim(`  Rendered: ${path.relative(destDir, destPath)}`);
      }
    }
  }

  const subdirs = [
    { name: 'root', dest: destDir },
    { name: 'react', dest: variables.REACT_APP_NAME ? path.join(destDir, variables.REACT_APP_NAME) : null },
    { name: 'react-lib', dest: variables.REACT_LIB_NAME ? path.join(destDir, variables.REACT_LIB_NAME) : null },
    { name: 'api', dest: variables.API_APP_NAME ? path.join(destDir, variables.API_APP_NAME) : null },
    { name: 'api-lib', dest: variables.API_LIB_NAME ? path.join(destDir, variables.API_LIB_NAME) : null },
    { name: 'lib', dest: variables.LIB_NAME ? path.join(destDir, variables.LIB_NAME) : null },
  ];

  for (const { name, dest } of subdirs) {
    if (!dest) continue;
    const src = path.join(templatesDir, name);
    if (fs.existsSync(src)) {
      renderDir(src, dest);
    }
  }
}

export function copyDir(srcDir: string, destDir: string, variables?: Record<string, any>, engineType: 'mustache' | 'handlebars' = 'mustache'): void {
  if (!fs.existsSync(srcDir)) return;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  const engine = variables ? createEngine(engineType) : null;
  
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const isMustache = entry.name.endsWith('.mustache');
    const destName = isMustache ? entry.name.replace(/\.mustache$/, '') : entry.name;
    const destPath = path.join(destDir, destName);
    
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath, variables, engineType);
    } else if (entry.isFile()) {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      
      if (isMustache && engine && variables) {
        // Render mustache template
        const template = fs.readFileSync(srcPath, 'utf8');
        const rendered = engine.render(template, variables);
        fs.writeFileSync(destPath, rendered, 'utf8');
        Logger.dim(`  Rendered: ${path.relative(destDir, destPath)}`);
      } else {
        // Direct copy with simple placeholder replacement
        let content = fs.readFileSync(srcPath, 'utf8');
        if (variables) {
          // Replace all @VARIABLE@ placeholders with their values
          Object.keys(variables).forEach(key => {
            const placeholder = `@${key.toUpperCase()}@`;
            const value = variables[key];
            if (typeof value === 'string') {
              content = content.replace(new RegExp(placeholder, 'g'), value);
            }
          });
        }
        fs.writeFileSync(destPath, content, 'utf8');
        Logger.dim(`  Copied: ${path.relative(destDir, destPath)}`);
      }
      
      setPerms(destPath);
    }
  }
}
