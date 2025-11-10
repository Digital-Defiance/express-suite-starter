import { environment } from '../environments/environment';

interface RuntimeConfig {
  apiUrl: string;
}

let runtimeConfig: RuntimeConfig | null = null;

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  if (runtimeConfig) return runtimeConfig;

  try {
    const response = await fetch('/config.json');
    runtimeConfig = await response.json();
    return runtimeConfig;
  } catch {
    runtimeConfig = { apiUrl: environment.apiUrl };
    return runtimeConfig;
  }
}

export function getApiBaseUrl(): string {
  const apiUrl = runtimeConfig?.apiUrl || environment.apiUrl;
  return apiUrl.replace(/\/api$/, '');
}
