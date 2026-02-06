import chalk from "chalk";
import select from "@inquirer/select";
import { resolveAll } from "../registry/resolve.js";
import { filterInstalled } from "../detect.js";
import { formatOutput } from "../format.js";

export async function selectAgent(): Promise<void> {
  const all = resolveAll();
  const installed = filterInstalled(all);

  const agents = installed.length > 0 ? installed : all;
  const label =
    installed.length > 0
      ? "Detected agents on this system"
      : "No agents detected — showing all supported agents";

  console.log(chalk.dim(label));

  const chosen = await select({
    message: "Select an agent:",
    choices: agents.map((a) => ({
      name: a.displayName ?? a.cmd,
      value: a.cmd,
    })),
  });

  const agent = agents.find((a) => a.cmd === chosen);
  if (agent) {
    console.log();
    console.log(formatOutput(agent));
  }
}
