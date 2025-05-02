export interface PackageResolution {
  name: string;
  version: string;
  resolved: string;
}

export interface PackageGroup {
  name: string;
  packages: string[];
  enabled: boolean;
  description?: string;
}

export interface RegistryConfig {
  url: string;
  scope?: string;
  auth?: {
    token?: string;
    username?: string;
    password?: string;
  };
}
