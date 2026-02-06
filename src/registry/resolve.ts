import type { AgentDef } from "./types.js";
import { builtinAgents } from "./builtin.js";
import { loadCustomAgents } from "./custom.js";

export function resolveAgent(
  cmd: string,
  customFilePath?: string,
): AgentDef | undefined {
  const custom = loadCustomAgents(customFilePath);

  // Check custom agents first (exact cmd or alias)
  for (const agent of custom) {
    if (agent.cmd === cmd) return agent;
    if (agent.cmdAliases?.includes(cmd)) return agent;
  }

  // Then check builtins
  for (const agent of builtinAgents) {
    if (agent.cmd === cmd) return agent;
    if (agent.cmdAliases?.includes(cmd)) return agent;
  }

  return undefined;
}

export function resolveAll(customFilePath?: string): AgentDef[] {
  const custom = loadCustomAgents(customFilePath);
  const merged = new Map<string, AgentDef>();

  // Add builtins first
  for (const agent of builtinAgents) {
    merged.set(agent.cmd, agent);
  }

  // Custom overrides builtin for same cmd
  for (const agent of custom) {
    merged.set(agent.cmd, agent);
  }

  return [...merged.values()];
}
