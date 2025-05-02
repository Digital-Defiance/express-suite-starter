export interface PackageConfig {
  dev: string[];
  prod: string[];
  versions?: Record<string, string>;
}
