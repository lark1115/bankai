import { Command } from "commander";
import { printAgent } from "./commands/print.js";
import { listAgents } from "./commands/agents.js";
import { addAgentCommand } from "./commands/add.js";
import { editAgentCommand } from "./commands/edit.js";
import { removeAgentCommand } from "./commands/remove.js";
import { selectAgent } from "./commands/select.js";

const program = new Command();

program
  .name("bankai")
  .description("Print approval-bypass startup commands for coding agent CLIs")
  .version("0.1.0");

// bankai <cmd> — print bypass command for a specific agent
program
  .argument("[cmd]", "agent command to look up")
  .option("-a, --agent <cmd>", "agent command to look up (alternative)")
  .action(async (cmd: string | undefined, opts: { agent?: string }) => {
    const target = cmd || opts.agent;
    if (target) {
      printAgent(target);
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

program.parse();
