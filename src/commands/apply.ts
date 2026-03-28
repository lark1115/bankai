import chalk from "chalk";
import type { SettingsAgentDef } from "../registry/types.js";
import { isAlreadyApplied, applySettings } from "../settings.js";

export async function applySettingsAgent(agent: SettingsAgentDef): Promise<boolean> {
  let anyFailed = false;
  const name = agent.displayName ?? agent.cmd;
  console.log(chalk.bold.cyan(`# ${name}`));
  console.log(chalk.dim("This agent uses settings files instead of CLI flags.\n"));

  // Check which targets are already applied
  const statuses = agent.targets.map((t) => ({
    target: t,
    applied: isAlreadyApplied(t),
  }));

  const allApplied = statuses.every((s) => s.applied);
  if (allApplied) {
    console.log(
      chalk.green("All settings are already applied:"),
    );
    for (const s of statuses) {
      console.log(chalk.green(`  ✓ ${s.target.description ?? s.target.kind}`));
    }
    return false;
  }

  // Show status of each target
  for (const s of statuses) {
    const label = s.target.description ?? s.target.kind;
    if (s.applied) {
      console.log(chalk.green(`  ✓ ${label} (already applied)`));
    } else {
      console.log(chalk.yellow(`  ○ ${label} (not applied)`));
    }
  }
  console.log();

  // Auto-apply all unapplied targets without confirmation
  const unapplied = statuses.filter((s) => !s.applied);

  for (const s of unapplied) {
    const label = s.target.description ?? s.target.kind;
    try {
      applySettings(s.target);
      console.log(chalk.green(`  ✓ Applied: ${label}`));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(chalk.yellow(`  ⚠ Failed: ${label} — ${msg} (continuing anyway)`));
      anyFailed = true;
    }
  }
  return anyFailed;
}
