import chalk from "chalk";
import { resolveAgent } from "../registry/resolve.js";
import { formatOutput } from "../format.js";
import { applySettingsAgent } from "./apply.js";

export async function printAgent(cmd: string): Promise<void> {
  const agent = resolveAgent(cmd);
  if (!agent) {
    console.error(
      chalk.red(`Unsupported agent: "${cmd}".`) +
        `\nRun ${chalk.yellow("bankai agents")} to see available agents, ` +
        `or ${chalk.yellow("bankai add")} to register a custom one.`,
    );
    process.exitCode = 1;
    return;
  }

  if (agent.type === "settings") {
    await applySettingsAgent(agent);
  } else {
    console.log(formatOutput(agent));
  }
}
