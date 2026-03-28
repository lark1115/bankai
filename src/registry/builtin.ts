import os from "node:os";
import type { AgentDef } from "./types.js";

function claudeSandboxAllowWrite(): string[] {
  const paths = ["/tmp"];
  const tmpdir = os.tmpdir();
  // macOS $TMPDIR resolves to /private/var/folders/... — include it if different from /tmp
  if (tmpdir !== "/tmp") {
    paths.push(tmpdir);
  }
  return paths;
}

export const builtinAgents: AgentDef[] = [
  {
    type: "settings",
    cmd: "claude",
    displayName: "Claude Code",
    lines: ["claude --dangerously-skip-permissions"],
    targets: [
      {
        kind: "json",
        scope: "global",
        filePath: "~/.claude/settings.json",
        merge: {
          sandbox: {
            filesystem: {
              allowWrite: claudeSandboxAllowWrite(),
            },
          },
        },
        description: "Global (~/.claude/settings.json) — sandbox /tmp write access",
      },
    ],
  },
  {
    type: "cli",
    cmd: "codex",
    displayName: "Codex CLI",
    lines: ["codex --dangerously-bypass-approvals-and-sandbox"],
  },
  {
    type: "cli",
    cmd: "copilot",
    displayName: "GitHub Copilot CLI",
    lines: ["copilot --allow-all-tools"],
  },
  {
    type: "cli",
    cmd: "gemini",
    displayName: "Gemini CLI",
    lines: ["gemini --yolo --sandbox=false"],
    cmdAliases: ["gemini-cli"],
  },
  {
    type: "cli",
    cmd: "openhands",
    displayName: "OpenHands",
    lines: ["openhands --always-approve"],
  },
  {
    type: "cli",
    cmd: "aider",
    displayName: "Aider",
    lines: ["aider --yes-always"],
  },
  {
    type: "cli",
    cmd: "qwen",
    displayName: "Qwen Code",
    lines: ["qwen-code --yolo"],
    cmdAliases: ["qwen-code"],
  },
  {
    type: "cli",
    cmd: "kimi",
    displayName: "Kimi Code",
    lines: ["kimi --yolo"],
  },
  {
    type: "cli",
    cmd: "opencode",
    displayName: "OpenCode",
    lines: ["OPENCODE_YOLO=true opencode"],
    cmdAliases: ["opencode-yolo"],
  },
  {
    type: "settings",
    cmd: "cursor-agent",
    displayName: "Cursor Agent CLI",
    lines: ["cursor-agent --yolo"],
    targets: [
      {
        kind: "json",
        scope: "project",
        filePath: ".cursor/cli.json",
        merge: {
          permissions: {
            allow: [
              "Shell(**)",
              "Read(**)",
              "Write(**)",
              "Delete(**)",
              "Grep(**)",
              "LS(**)",
            ],
            deny: [],
          },
        },
        description: "Project (.cursor/cli.json)",
      },
      {
        kind: "json",
        scope: "global",
        filePath: "~/.cursor/cli-config.json",
        merge: {
          permissions: {
            allow: [
              "Shell(**)",
              "Read(**)",
              "Write(**)",
              "Delete(**)",
              "Grep(**)",
              "LS(**)",
            ],
            deny: [],
          },
        },
        description: "Global (~/.cursor/cli-config.json)",
      },
    ],
  },
  {
    type: "settings",
    cmd: "cursor",
    displayName: "Cursor IDE",
    targets: [
      {
        kind: "sqlite",
        scope: "global",
        dbPath:
          "~/Library/Application Support/Cursor/User/globalStorage/state.vscdb",
        table: "ItemTable",
        key: "src.vs.platform.reactivestorage.browser.reactiveStorageServiceImpl.persistentStorage.applicationUser",
        mergePath: "composerState",
        merge: {
          playwrightProtection: false,
          yoloDotFilesDisabled: false,
          yoloOutsideWorkspaceDisabled: false,
          yoloDeleteFileDisabled: false,
          yoloMcpToolsDisabled: false,
        },
        modes4Patch: {
          id: "agent",
          set: { autoRun: true, fullAutoRun: true },
        },
        description: "IDE Auto-Run (SQLite DB)",
      },
    ],
  },
];
