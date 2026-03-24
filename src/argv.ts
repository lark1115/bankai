export type DirectAgentInvocation = {
  cmd: string;
  extraArgs: string[];
};

const RESERVED_TOP_LEVEL_COMMANDS = new Set(["agents", "add", "edit", "remove", "help"]);
const RESERVED_TOP_LEVEL_FLAGS = new Set(["-h", "--help", "-V", "--version"]);

function stripLeadingSeparator(args: string[]): string[] {
  return args[0] === "--" ? args.slice(1) : args;
}

export function extractDirectAgentInvocation(argv: string[]): DirectAgentInvocation | null {
  if (argv.length === 0) return null;

  const [first, ...rest] = argv;

  if (RESERVED_TOP_LEVEL_FLAGS.has(first)) return null;
  if (RESERVED_TOP_LEVEL_COMMANDS.has(first)) return null;

  if (first === "-a" || first === "--agent") {
    const [cmd, ...extraArgs] = rest;
    if (!cmd || cmd.startsWith("-")) return null;
    return { cmd, extraArgs: stripLeadingSeparator(extraArgs) };
  }

  if (first.startsWith("--agent=")) {
    const cmd = first.slice("--agent=".length).trim();
    if (!cmd || cmd.startsWith("-")) return null;
    return { cmd, extraArgs: stripLeadingSeparator(rest) };
  }

  if (first.startsWith("-")) return null;

  return { cmd: first, extraArgs: stripLeadingSeparator(rest) };
}
