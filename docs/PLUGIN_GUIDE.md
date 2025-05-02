# Plugin System Guide

## Overview

The Express Suite Starter plugin system allows you to extend the generator with custom steps, hooks, and templates without modifying the core code.

## Plugin Interface

```typescript
interface Plugin {
  name: string;
  version: string;
  hooks?: PluginHooks;
  steps?: Step[];
  templates?: TemplateProvider;
}
```

## Creating a Plugin

### Basic Plugin

```typescript
import { Plugin } from '@digitaldefiance/express-suite-starter';

export const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
};
```

### Plugin with Hooks

```typescript
export const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  
  hooks: {
    beforeGeneration: async (context) => {
      console.log('Starting generation...');
    },
    
    afterGeneration: async (context) => {
      console.log('Generation complete!');
    },
    
    beforeStep: async (stepName, context) => {
      console.log(`About to execute: ${stepName}`);
    },
    
    afterStep: async (stepName, context) => {
      console.log(`Completed: ${stepName}`);
    },
    
    onError: async (error, context) => {
      console.error('Error occurred:', error);
    },
  },
};
```

### Plugin with Custom Steps

```typescript
export const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  
  steps: [
    {
      name: 'customSetup',
      description: 'Custom setup step',
      execute: (context) => {
        // Your custom logic
        context.state.set('customSetupComplete', true);
      },
    },
    {
      name: 'optionalStep',
      description: 'Optional custom step',
      execute: (context) => {
        // Custom logic
      },
      skip: (context) => {
        // Skip if not enabled
        return !context.state.get('enableOptionalStep');
      },
    },
  ],
};
```

### Plugin with Templates

```typescript
export const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  
  templates: {
    getTemplatesDir: () => {
      return path.join(__dirname, 'templates');
    },
    
    getVariables: (context) => {
      return {
        MY_PLUGIN_VAR: 'custom-value',
        PLUGIN_ENABLED: true,
      };
    },
  },
};
```

## Available Hooks

### beforeGeneration
Called once before any steps execute.

```typescript
beforeGeneration: async (context: GeneratorContext) => {
  // Initialize plugin state
  context.state.set('pluginInitialized', true);
}
```

### afterGeneration
Called once after all steps complete successfully.

```typescript
afterGeneration: async (context: GeneratorContext) => {
  // Cleanup or post-processing
  console.log('All done!');
}
```

### beforeStep
Called before each step executes.

```typescript
beforeStep: async (stepName: string, context: GeneratorContext) => {
  // Log or prepare for step
  console.log(`Starting ${stepName}`);
}
```

### afterStep
Called after each step completes successfully.

```typescript
afterStep: async (stepName: string, context: GeneratorContext) => {
  // Post-step processing
  console.log(`Finished ${stepName}`);
}
```

### onError
Called when any step fails.

```typescript
onError: async (error: Error, context: GeneratorContext) => {
  // Error handling or logging
  console.error('Step failed:', error.message);
}
```

## Using Plugins

### Register Plugin

```typescript
import { PluginManager } from './core/plugin-manager';
import { myPlugin } from './plugins/my-plugin';

const pluginManager = new PluginManager();
pluginManager.register(myPlugin);

const executor = new StepExecutor(pluginManager);
```

### Multiple Plugins

```typescript
pluginManager.register(plugin1);
pluginManager.register(plugin2);
pluginManager.register(plugin3);
```

## Example Plugins

### Logging Plugin

```typescript
export const loggingPlugin: Plugin = {
  name: 'logging-plugin',
  version: '1.0.0',
  
  hooks: {
    beforeStep: async (stepName) => {
      console.log(`[${new Date().toISOString()}] Starting: ${stepName}`);
    },
    
    afterStep: async (stepName) => {
      console.log(`[${new Date().toISOString()}] Completed: ${stepName}`);
    },
  },
};
```

### Docker Plugin

```typescript
export const dockerPlugin: Plugin = {
  name: 'docker-plugin',
  version: '1.0.0',
  
  steps: [
    {
      name: 'generateDockerfile',
      description: 'Generate Dockerfile',
      execute: (context) => {
        const monorepoPath = context.state.get('monorepoPath');
        const dockerfile = `
FROM node:22
WORKDIR /app
COPY . .
RUN yarn install
CMD ["yarn", "serve"]
        `;
        fs.writeFileSync(path.join(monorepoPath, 'Dockerfile'), dockerfile);
      },
    },
  ],
  
  templates: {
    getTemplatesDir: () => path.join(__dirname, 'docker-templates'),
    getVariables: () => ({
      DOCKER_ENABLED: true,
      NODE_VERSION: '22',
    }),
  },
};
```

### Git Hooks Plugin

```typescript
export const gitHooksPlugin: Plugin = {
  name: 'git-hooks-plugin',
  version: '1.0.0',
  
  hooks: {
    afterGeneration: async (context) => {
      const monorepoPath = context.state.get('monorepoPath');
      
      // Install husky
      runCommand('yarn add -D husky', { cwd: monorepoPath });
      runCommand('npx husky init', { cwd: monorepoPath });
      
      // Add pre-commit hook
      const preCommit = `#!/bin/sh
yarn lint:all
yarn test
`;
      fs.writeFileSync(
        path.join(monorepoPath, '.husky', 'pre-commit'),
        preCommit
      );
    },
  },
};
```

## Plugin Best Practices

1. **Naming**: Use descriptive names with `-plugin` suffix
2. **Versioning**: Follow semantic versioning
3. **Error Handling**: Wrap hook logic in try-catch
4. **State Management**: Use context.state for plugin data
5. **Skip Conditions**: Make steps optional when possible
6. **Documentation**: Document what your plugin does
7. **Testing**: Write tests for your plugin

## Plugin Distribution

### NPM Package

```json
{
  "name": "@myorg/express-suite-my-plugin",
  "version": "1.0.0",
  "main": "dist/index.js",
  "peerDependencies": {
    "@digitaldefiance/express-suite-starter": "^2.0.0"
  }
}
```

### Usage

```typescript
import { myPlugin } from '@myorg/express-suite-my-plugin';

pluginManager.register(myPlugin);
```

## Troubleshooting

### Plugin Not Executing

Check that:
1. Plugin is registered before executor.execute()
2. Hook names are spelled correctly
3. Steps have unique names

### Hook Errors

Hooks that throw errors are caught and logged but don't stop execution. Check logs for warnings.

### Step Not Running

Check skip condition:
```typescript
skip: (context) => {
  console.log('Skip condition:', context.state.get('someFlag'));
  return false; // Always run for debugging
}
```

## License

MIT © Digital Defiance
