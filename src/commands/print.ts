import chalk from "chalk";
import { resolveAgent } from "../registry/resolve.js";
import { formatOutput } from "../format.js";

export function printAgent(cmd: string): void {
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
  console.log(formatOutput(agent));
}
