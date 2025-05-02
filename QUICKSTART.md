# Quick Start Guide

## Running the Generator

### 1. Install Dependencies
```bash
yarn install
```

### 2. Run Tests
```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run with coverage
yarn test:coverage

# Run and save output to file
yarn test:logged
```

### 3. Build the Project
```bash
# Build TypeScript
yarn build

# Build and save output to file
yarn build:logged
```

### 4. Generate a New Monorepo
```bash
# Interactive mode (recommended)
yarn start

# Or use the alias
yarn create-project
```

The generator will prompt you for:
- Workspace name (e.g., "my-app")
- Prefix (e.g., "my-app")
- Namespace (e.g., "@mycompany")
- Parent directory (where to create the monorepo)
- Git repository URL (optional)
- DevContainer configuration:
  - Enable devcontainer? (yes/no)
  - Include MongoDB? (yes/no, if devcontainer enabled)
  - Use MongoDB replica set? (yes/no, if MongoDB enabled)

### 5. Sync Templates from Reference Project
```bash
yarn sync-templates
```

This tool helps keep templates up-to-date by:
- Copying files from a reference project
- Replacing project-specific values with Mustache variables
- Adding .mustache extension to all files

## Testing the Generated Project

After generation completes:

```bash
cd ../my-app  # Or your workspace name

# Install dependencies
yarn install

# Initialize database
yarn inituserdb:full:drop

# Build all projects
yarn build:dev

# Start development server
yarn serve:dev

# Run tests
yarn test:all
```

## Development Workflow

### Running Tests During Development
```bash
# Terminal 1: Watch mode for tests
yarn test:watch

# Terminal 2: Make changes to code
# Tests will automatically re-run
```

### Debugging Failed Generation

If generation fails, check:
1. `test.log` or `build.log` for errors
2. Checkpoint file at `/tmp/.{workspace-name}.checkpoint`
3. Resume from specific step:
   ```bash
   yarn start --start-at=stepName
   ```

### Available Test Suites

**Unit Tests (15 files):**
- config-schema.spec.ts
- template-engine.spec.ts
- project-config-builder.spec.ts
- project-generator.spec.ts
- step-executor.spec.ts
- template-renderer.spec.ts
- logger.spec.ts
- shell-utils.spec.ts
- plugin-manager.spec.ts
- post-generation-validator.spec.ts
- package-resolver.spec.ts
- dry-run-executor.spec.ts
- doc-generator.spec.ts
- diff-viewer.spec.ts
- devcontainer-config.spec.ts

**Integration Tests (3 files):**
- full-generation.spec.ts
- plugin-integration.spec.ts
- validation-integration.spec.ts

## Common Issues

### TypeScript Compilation Errors
```bash
# Clean and rebuild
rm -rf dist
yarn build
```

### Test Failures
```bash
# Clear Jest cache
yarn test --clearCache

# Run specific test file
yarn test devcontainer-config.spec.ts
```

### Template Sync Issues
```bash
# Ensure source directory exists
ls -la ../digitaldefiance-express-suite-example

# Run with default settings
yarn sync-templates
```

## Next Steps

1. **Customize Templates**: Edit files in `templates/` directory
2. **Add Plugins**: Create plugins in `src/plugins/` (see PLUGIN_GUIDE.md)
3. **Modify Presets**: Edit `config/presets/standard.json`
4. **Update Documentation**: Keep CONTEXT.md current with changes

## File Locations

- **Source Code**: `src/`
- **Tests**: `tests/unit/` and `tests/integration/`
- **Templates**: `templates/`
- **Configuration**: `config/presets/`
- **Tools**: `tools/`
- **Documentation**: `docs/`
- **Build Output**: `dist/`
- **Test Logs**: `test.log`, `build.log`
