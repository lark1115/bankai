import { Command } from "commander";
import { runAgent } from "./commands/run.js";
import { listAgents } from "./commands/agents.js";
import { addAgentCommand } from "./commands/add.js";
import { editAgentCommand } from "./commands/edit.js";
import { removeAgentCommand } from "./commands/remove.js";
import { selectAgent } from "./commands/select.js";
import { showShimmer } from "./ui/shimmer.js";

const program = new Command();

program
  .name("bankai")
  .description("Launch coding agent CLIs with approval-bypass flags")
  .version("0.4.1");

// bankai <cmd> [args...] — launch a specific agent with bypass flags
program
  .argument("[cmd]", "agent command to look up")
  .argument("[args...]", "extra arguments to pass to the agent")
  .option("-a, --agent <cmd>", "agent command to look up (alternative)")
  .action(async (cmd: string | undefined, args: string[], opts: { agent?: string }) => {
    const target = cmd || opts.agent;
    if (target) {
      await runAgent(target, args);
    } else {
      await selectAgent();
    }
  });

// bankai agents
program
  .command("agents")
  .description("List all supported agents")
  .option("--installed", "Only show agents detected on this system")
  .action((opts) => {
    listAgents(opts);
  });

// bankai add
program
  .command("add")
  .description("Register a custom agent")
  .option("--cmd <name>", "Command name")
  .option("--line <line...>", "Bypass command line(s)")
  .option("--display-name <name>", "Display name")
  .option("--alias <alias...>", "Command aliases")
  .action(async (opts) => {
    await addAgentCommand(opts);
  });

// bankai edit <cmd>
program
  .command("edit <cmd>")
  .description("Edit an existing custom agent")
  .action(async (cmd: string) => {
    await editAgentCommand(cmd);
  });

// bankai remove <cmd>
program
  .command("remove <cmd>")
  .description("Remove a custom agent")
  .action((cmd: string) => {
    removeAgentCommand(cmd);
  });

// Show shimmer for top-level help
const args = process.argv.slice(2);
const isTopLevelHelp = args.length <= 1 && (args.includes("--help") || args.includes("-h"));
if (isTopLevelHelp) await showShimmer();

program.parseAsync().catch((err) => {
  if (err?.name === "ExitPromptError") {
    process.exit(130);
  }
  throw err;
});
