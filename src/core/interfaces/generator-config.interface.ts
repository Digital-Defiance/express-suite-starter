import { WorkspaceConfig } from './workspace-config.interface';
import { ProjectConfig } from './project-config.interface';
import { PackageConfig } from './package-config.interface';
import { TemplateConfig } from './template-config.interface';
import { NxConfig } from './nx-config.interface';
import { NodeConfig } from './node-config.interface';
import { DevContainerConfig } from './devcontainer-config.interface';

export interface GeneratorConfig {
  workspace: WorkspaceConfig;
  projects: ProjectConfig[];
  packages: PackageConfig;
  templates: TemplateConfig;
  nx: NxConfig;
  node: NodeConfig;
  devcontainer?: DevContainerConfig;
}
