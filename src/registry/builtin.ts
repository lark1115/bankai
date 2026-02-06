import type { AgentDef } from "./types.js";

export const builtinAgents: AgentDef[] = [
  {
    cmd: "claude",
    displayName: "Claude Code",
    lines: ["claude --dangerously-skip-permissions"],
  },
  {
    cmd: "codex",
    displayName: "Codex CLI",
    lines: ["codex --full-auto"],
  },
  {
    cmd: "gemini",
    displayName: "Gemini CLI",
    lines: ["gemini -s"],
    cmdAliases: ["gemini-cli"],
  },
  {
    cmd: "openhands",
    displayName: "OpenHands",
    lines: ["openhands --no-confirm"],
  },
  {
    cmd: "aider",
    displayName: "Aider",
    lines: ["aider --yes-always"],
  },
];
