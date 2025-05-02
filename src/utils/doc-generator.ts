import { GeneratorContext } from '../core/interfaces';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../cli/logger';

export class DocGenerator {
  static generateProjectDocs(context: GeneratorContext): void {
    const monorepoPath = context.state.get('monorepoPath');
    const workspaceName = context.config.workspace?.name || 'project';
    
    this.generateReadme(monorepoPath, context);
    this.generateArchitectureDoc(monorepoPath, context);
    this.generateApiDocs(monorepoPath, context);
  }

  private static generateReadme(monorepoPath: string, context: GeneratorContext): void {
    const workspaceName = context.config.workspace?.name || 'project';
    const projects = context.config.projects || [];
    
    const readme = `# ${workspaceName}

## Overview

Generated with Express Suite Starter.

## Projects

${projects.map((p: any) => `- **${p.name}** (${p.type})`).join('\n')}

## Getting Started

\`\`\`bash
# Install dependencies
yarn install

# Build all projects
yarn build:dev

# Run development server
yarn serve:dev

# Run tests
yarn test:all
\`\`\`

## Scripts

- \`yarn build\` - Production build
- \`yarn build:dev\` - Development build
- \`yarn serve:dev\` - Start API server
- \`yarn test:all\` - Run all tests
- \`yarn lint:all\` - Lint all projects

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for details.

## License

MIT
`;

    fs.writeFileSync(path.join(monorepoPath, 'README.md'), readme);
    Logger.dim('  Generated: README.md');
  }

  private static generateArchitectureDoc(monorepoPath: string, context: GeneratorContext): void {
    const projects = context.config.projects || [];
    
    const arch = `# Architecture

## Project Structure

\`\`\`
${context.config.workspace?.name}/
${projects.map((p: any) => `├── ${p.name}/`).join('\n')}
\`\`\`

## Technology Stack

- **Frontend:** React 19, TypeScript, Material-UI
- **Backend:** Express 5, Node.js
- **Database:** MongoDB
- **Build:** Nx, Vite
- **Testing:** Jest, Playwright

## Data Flow

1. React frontend makes API calls
2. Express API processes requests
3. MongoDB stores data
4. Shared libraries provide common logic

## Development

See README.md for development commands.
`;

    fs.writeFileSync(path.join(monorepoPath, 'ARCHITECTURE.md'), arch);
    Logger.dim('  Generated: ARCHITECTURE.md');
  }

  private static generateApiDocs(monorepoPath: string, context: GeneratorContext): void {
    const apiProject = context.config.projects?.find((p: any) => p.type === 'api');
    if (!apiProject) return;

    const apiDocs = `# API Documentation

## Base URL

\`http://localhost:3000/api\`

## Endpoints

### Health Check

\`\`\`
GET /health
\`\`\`

Returns API health status.

## Authentication

Add authentication documentation here.

## Error Handling

All errors return:

\`\`\`json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
\`\`\`

## Rate Limiting

Add rate limiting documentation here.
`;

    const apiDocsPath = path.join(monorepoPath, apiProject.name, 'API.md');
    fs.writeFileSync(apiDocsPath, apiDocs);
    Logger.dim(`  Generated: ${apiProject.name}/API.md`);
  }
}
