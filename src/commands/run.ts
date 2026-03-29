import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import chalk from "chalk";
import { resolveAgent } from "../registry/resolve.js";
import { applySettingsAgent } from "./apply.js";

function execAgent(line: string, extraArgs: string[] = []): Promise<number> {
  // Remove GH_TOKEN from child env — parent shell's grepo chpwd hook
  // sets GH_TOKEN for the parent's cwd scope, but agents run in different
  // directories and can't switch scopes. Let gh fall back to keyring auth.
  const { GH_TOKEN, ...cleanEnv } = process.env;
  const fullCmd = extraArgs.length > 0 ? `${line} ${extraArgs.join(" ")}` : line;
  return new Promise((resolve) => {
    const child = spawn(fullCmd, [], { stdio: "inherit", shell: true, env: cleanEnv });
    child.on("close", (code) => resolve(code ?? 1));
    child.on("error", (err) => {
      console.error(chalk.red(`Failed to start: ${err.message}`));
      resolve(1);
    });
  });
}

/** Workaround for cursor-agent workspace trust prompt */
function ensureCursorAgentTrust(): void {
  const cwd = process.cwd();
  const slug = cwd.replace(/^\//, "").replace(/[/.]/g, "-");
  const dir = join(homedir(), ".cursor", "projects", slug);
  const file = join(dir, ".workspace-trusted");
  try {
    readFileSync(file, "utf-8");
    return; // already trusted
  } catch {
    mkdirSync(dir, { recursive: true });
  }
  const content = JSON.stringify({ trustedAt: new Date().toISOString(), workspacePath: cwd });
  writeFileSync(file, content);
}

/** Workaround for codex-cli trust prompt regression (openai/codex#14345) */
function ensureCodexTrust(): void {
  const configPath = join(homedir(), ".codex", "config.toml");
  const cwd = process.cwd();
  const key = `[projects."${cwd}"]`;
  try {
    const content = readFileSync(configPath, "utf-8");
    if (content.match(new RegExp(`^\\[projects\\."${cwd.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"\\]`, "m"))) return;
  } catch {
    mkdirSync(join(homedir(), ".codex"), { recursive: true });
  }
  appendFileSync(configPath, `\n${key}\ntrust_level = "trusted"\n`);
}

export async function runAgent(cmd: string, extraArgs: string[] = []): Promise<void> {
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
    if (agent.cmd === "cursor-agent") ensureCursorAgentTrust();
    const settingsFailed = await applySettingsAgent(agent);
    const line = agent.lines?.[0] ?? agent.cmd;
    const code = await execAgent(line, extraArgs);
    process.exitCode = code || (settingsFailed ? 1 : 0);
  } else {
    if (agent.cmd === "codex") ensureCodexTrust();
    const line = agent.lines[0];
    const code = await execAgent(line, extraArgs);
    process.exitCode = code;
  }
}
