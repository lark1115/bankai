import chalk from "chalk";
import type { CliAgentDef } from "./registry/types.js";

export function formatOutput(agent: CliAgentDef): string {
  const name = agent.displayName ?? agent.cmd;
  const header = chalk.bold.cyan(`# ${name}`);
  const lines = agent.lines.map((l) => chalk.green(l)).join("\n");
  return `${header}\n${lines}`;
}
