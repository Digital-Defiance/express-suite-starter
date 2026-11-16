/**
 * Find the version range a preset gives for a package.
 * Preset entries look like "name", "name@range" or "@scope/name@range".
 * Returns the fallback when the package is missing or has no range.
 */
export function getPackageRange(
  packages: readonly string[] | undefined,
  name: string,
  fallback = 'latest',
): string {
  const prefix = `${name}@`;
  const entry = (packages ?? []).find((pkg) => pkg.startsWith(prefix));
  return entry ? entry.slice(prefix.length) || fallback : fallback;
}
