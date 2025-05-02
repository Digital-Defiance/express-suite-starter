# NPX Setup Guide

## Making the Package Executable with npx

### Package Configuration

The package is configured for npx execution with:

```json
{
  "name": "@digitaldefiance/express-suite-starter",
  "bin": {
    "create-express-suite": "./dist/src/cli.js"
  },
  "files": [
    "dist",
    "templates",
    "config",
    "README.md"
  ]
}
```

### Usage

**With npx (recommended):**
```bash
npx @digitaldefiance/express-suite-starter
```

**Or with the command alias:**
```bash
npx create-express-suite
```

**With specific version:**
```bash
npx @digitaldefiance/express-suite-starter@latest
```

### Publishing to npm

1. **Build the package:**
   ```bash
   yarn build
   ```

2. **Test locally:**
   ```bash
   npm link
   create-express-suite
   ```

3. **Publish to npm:**
   ```bash
   # First time (public package)
   npm publish --access public

   # Updates
   npm version patch  # or minor, major
   npm publish
   ```

4. **Test published package:**
   ```bash
   npx @digitaldefiance/express-suite-starter@latest
   ```

### Local Testing

**Test as if installed globally:**
```bash
# In this package directory
npm link

# Now you can run from anywhere
create-express-suite

# Unlink when done
npm unlink -g @digitaldefiance/express-suite-starter
```

**Test with npx locally:**
```bash
# Pack the package
npm pack

# Install from tarball
npm install -g ./digitaldefiance-express-suite-starter-1.0.0.tgz

# Test
create-express-suite

# Uninstall
npm uninstall -g @digitaldefiance/express-suite-starter
```

### Files Included in Package

The `files` field in package.json determines what gets published:

- `dist/` - Compiled JavaScript
- `templates/` - Project templates
- `config/` - Configuration presets
- `README.md` - Documentation

**Excluded automatically:**
- `src/` - TypeScript source (not needed after build)
- `tests/` - Test files
- `node_modules/` - Dependencies
- `.git/` - Git files
- `*.log` - Log files

### Entry Point

The CLI entry point (`src/cli.ts`) is a simple wrapper:

```typescript
#!/usr/bin/env node
import { main } from './generate-monorepo';

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```

The shebang (`#!/usr/bin/env node`) tells the system to execute with Node.js.

### Pre-publish Checks

The `prepublishOnly` script runs automatically before publishing:

```json
{
  "scripts": {
    "prepublishOnly": "yarn build && yarn test"
  }
}
```

This ensures:
- TypeScript compiles successfully
- All tests pass
- Package is ready for distribution

### Version Management

```bash
# Patch version (1.0.0 -> 1.0.1)
npm version patch

# Minor version (1.0.0 -> 1.1.0)
npm version minor

# Major version (1.0.0 -> 2.0.0)
npm version major

# Publish after version bump
npm publish
```

### Scoped Package Notes

Since this is a scoped package (`@digitaldefiance/...`):

- First publish requires `--access public`
- Subsequent publishes don't need the flag
- Users must include the full scope in npx commands

### Testing the Published Package

```bash
# Create test directory
mkdir /tmp/test-npx
cd /tmp/test-npx

# Run with npx
npx @digitaldefiance/express-suite-starter

# Follow prompts to generate a project
```

### Troubleshooting

**"command not found" after npm link:**
- Check npm global bin directory: `npm bin -g`
- Ensure it's in your PATH

**npx uses old version:**
- Clear npx cache: `npx clear-npx-cache`
- Or force latest: `npx @digitaldefiance/express-suite-starter@latest`

**Package not found on npm:**
- Verify package name: `npm view @digitaldefiance/express-suite-starter`
- Check npm registry: `npm config get registry`

**Permission errors:**
- Use `sudo` for global installs (not recommended)
- Or configure npm to use user directory: `npm config set prefix ~/.npm-global`
