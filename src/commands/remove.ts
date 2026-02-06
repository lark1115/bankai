import chalk from "chalk";
import { removeAgent } from "../registry/custom.js";

export function removeAgentCommand(cmd: string): void {
  try {
    removeAgent(cmd);
    console.log(chalk.green(`Removed agent "${cmd}".`));
  } catch (err) {
    console.error(chalk.red((err as Error).message));
    process.exitCode = 1;
  }
}
