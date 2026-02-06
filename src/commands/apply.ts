import chalk from "chalk";
import select from "@inquirer/select";
import confirm from "@inquirer/confirm";
import type { SettingsAgentDef } from "../registry/types.js";
import { isAlreadyApplied, applySettings } from "../settings.js";

export async function applySettingsAgent(agent: SettingsAgentDef): Promise<void> {
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
    return;
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

  // Filter to unapplied targets
  const unapplied = statuses.filter((s) => !s.applied);

  let target;
  if (unapplied.length === 1) {
    target = unapplied[0].target;
  } else {
    // Let user pick which target to apply
    const chosen = await select({
      message: "Select a target to apply:",
      choices: unapplied.map((s) => ({
        name: s.target.description ?? s.target.kind,
        value: s.target,
      })),
    });
    target = chosen;
  }

  const label = target.description ?? target.kind;
  const ok = await confirm({
    message: `Apply settings to ${label}?`,
    default: true,
  });

  if (!ok) {
    console.log(chalk.dim("Cancelled."));
    return;
  }

  try {
    applySettings(target);
    console.log(chalk.green(`\n✓ Applied settings to ${label}`));

    if (target.kind === "sqlite") {
      console.log(chalk.yellow("\nRestart the application for changes to take effect."));
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(`\nFailed to apply settings: ${msg}`));
    process.exitCode = 1;
  }
}
