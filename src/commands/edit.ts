import chalk from "chalk";
import input from "@inquirer/input";
import { resolveAgent } from "../registry/resolve.js";
import { updateAgent } from "../registry/custom.js";
import { loadCustomAgents } from "../registry/custom.js";

export async function editAgentCommand(cmd: string): Promise<void> {
  const custom = loadCustomAgents();
  const existing = custom.find((a) => a.cmd === cmd);

  if (!existing) {
    // Check if it's a builtin
    const builtin = resolveAgent(cmd);
    if (builtin) {
      console.error(
        chalk.red(`"${cmd}" is a built-in agent. Use ${chalk.yellow("bankai add")} to create a custom override.`),
      );
    } else {
      console.error(chalk.red(`Custom agent "${cmd}" not found.`));
    }
    process.exitCode = 1;
    return;
  }

  const displayName = await input({
    message: "Display name:",
    default: existing.displayName ?? "",
  });

  const linesRaw = await input({
    message: "Bypass command(s), comma-separated:",
    default: existing.lines.join(", "),
  });
  const lines = linesRaw.split(",").map((l) => l.trim()).filter(Boolean);

  const aliasRaw = await input({
    message: "Aliases, comma-separated:",
    default: existing.cmdAliases?.join(", ") ?? "",
  });
  const aliases = aliasRaw
    ? aliasRaw.split(",").map((a) => a.trim()).filter(Boolean)
    : undefined;

  try {
    updateAgent(cmd, {
      displayName: displayName || undefined,
      lines,
      cmdAliases: aliases && aliases.length > 0 ? aliases : undefined,
    });
    console.log(chalk.green(`Updated agent "${cmd}".`));
  } catch (err) {
    console.error(chalk.red((err as Error).message));
    process.exitCode = 1;
  }
}
