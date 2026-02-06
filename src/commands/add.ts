import chalk from "chalk";
import input from "@inquirer/input";
import { CustomAgentDefSchema } from "../registry/types.js";
import { addAgent } from "../registry/custom.js";

interface AddOpts {
  cmd?: string;
  line?: string[];
  displayName?: string;
  alias?: string[];
}

export async function addAgentCommand(opts: AddOpts): Promise<void> {
  let cmd = opts.cmd;
  let lines = opts.line;
  let displayName = opts.displayName;
  let aliases = opts.alias;

  // Interactive mode if --cmd not provided
  if (!cmd) {
    cmd = await input({ message: "Command name (e.g. myagent):" });
    displayName = await input({
      message: "Display name (optional, press Enter to skip):",
    });
    const linesRaw = await input({
      message: "Bypass command(s), comma-separated:",
    });
    lines = linesRaw.split(",").map((l) => l.trim()).filter(Boolean);
    const aliasRaw = await input({
      message: "Aliases, comma-separated (optional, press Enter to skip):",
    });
    aliases = aliasRaw
      ? aliasRaw.split(",").map((a) => a.trim()).filter(Boolean)
      : undefined;
  }

  if (!lines || lines.length === 0) {
    console.error(chalk.red("At least one --line is required."));
    process.exitCode = 1;
    return;
  }

  const agent = CustomAgentDefSchema.parse({
    cmd,
    displayName: displayName || undefined,
    lines,
    cmdAliases: aliases && aliases.length > 0 ? aliases : undefined,
  });

  try {
    addAgent(agent);
    console.log(chalk.green(`Added custom agent "${cmd}".`));
  } catch (err) {
    console.error(chalk.red((err as Error).message));
    process.exitCode = 1;
  }
}
