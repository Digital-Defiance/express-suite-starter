/**
 * Interpolates template strings in the form of ${VAR} or {{VAR}} with values from the context object.
 * Example: interpolateTemplateStrings("build:${apiAppName}", { apiAppName: "my-api" }) => "build:my-api"
 */
export function interpolateTemplateStrings(template: string, context: Record<string, any>): string {
  // Replace ${VAR} and {{VAR}} with context[VAR]
  return template.replace(/\$\{(\w+)\}|\{\{(\w+)\}\}/g, (_, var1, var2) => {
    const key = var1 || var2;
    return key in context ? String(context[key]) : "";
  });
}
