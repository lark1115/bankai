import { spawn } from "node:child_process";
import chalk from "chalk";
import { resolveAgent } from "../registry/resolve.js";
import { applySettingsAgent } from "./apply.js";

function execAgent(line: string): Promise<number> {
  const [cmd, ...args] = line.split(/\s+/);
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: "inherit", shell: true });
    child.on("close", (code) => resolve(code ?? 1));
    child.on("error", (err) => {
      console.error(chalk.red(`Failed to start: ${err.message}`));
      resolve(1);
    });
  });
}

export async function runAgent(cmd: string): Promise<void> {
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
    const code = await execAgent(agent.cmd);
    process.exitCode = code;
  } else {
    const line = agent.lines[0];
    const code = await execAgent(line);
    process.exitCode = code;
  }
}
