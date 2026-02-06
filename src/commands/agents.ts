import chalk from "chalk";
import { resolveAll } from "../registry/resolve.js";
import { filterInstalled } from "../detect.js";

export function listAgents(opts: { installed?: boolean }): void {
  let agents = resolveAll();

  if (opts.installed) {
    agents = filterInstalled(agents);
    if (agents.length === 0) {
      console.log(chalk.yellow("No supported agents detected on this system."));
      return;
    }
  }

  for (const agent of agents) {
    const name = agent.displayName
      ? `${chalk.bold(agent.cmd)} ${chalk.dim(`(${agent.displayName})`)}`
      : chalk.bold(agent.cmd);
    const lines = agent.lines.map((l) => chalk.green(l)).join(", ");
    console.log(`  ${name}  →  ${lines}`);
  }
}
