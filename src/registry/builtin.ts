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
    lines: ["codex --dangerously-bypass-approvals-and-sandbox"],
  },
  {
    cmd: "gemini",
    displayName: "Gemini CLI",
    lines: ["gemini --yolo"],
    cmdAliases: ["gemini-cli"],
  },
  {
    cmd: "openhands",
    displayName: "OpenHands",
    lines: ["openhands --always-approve"],
  },
  {
    cmd: "aider",
    displayName: "Aider",
    lines: ["aider --yes-always"],
  },
];
