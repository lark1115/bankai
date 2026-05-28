import chalk from "chalk";

/**
 * Resolve an agent's `env` map into concrete values, interpolating any
 * `${VAR}` references against a source environment (defaults to process.env).
 *
 * This keeps secrets (API tokens, etc.) out of agent definitions: a value like
 * `"${ZAI_API_KEY}"` is replaced at launch time with the value held in the
 * shell environment. Literal values pass through unchanged. Missing references
 * resolve to an empty string and emit a warning so failures are diagnosable.
 */
export function resolveEnvVars(
  env: Record<string, string> | undefined,
  source: NodeJS.ProcessEnv = process.env,
): Record<string, string> | undefined {
  if (!env) return undefined;
  const resolved: Record<string, string> = {};
  for (const [key, raw] of Object.entries(env)) {
    resolved[key] = raw.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_, name) => {
      const value = source[name];
      if (value === undefined) {
        console.error(
          chalk.yellow(
            `Warning: env var "${name}" referenced by agent is not set; using empty string.`,
          ),
        );
        return "";
      }
      return value;
    });
  }
  return resolved;
}
