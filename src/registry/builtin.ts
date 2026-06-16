import type { AgentDef } from "./types.js";

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
            enabled: false,
          },
        },
        description: "Global (~/.claude/settings.json) — disable sandbox",
      },
    ],
  },
  {
    // Claude Code pointed at Z.AI's Anthropic-compatible endpoint (GLM models).
    // The API key is NOT stored here — set ZAI_API_KEY in your shell (or sops)
    // and it is interpolated into ANTHROPIC_AUTH_TOKEN at launch.
    //
    // Model mapping per the Z.AI "How to Switch Models" docs
    // (https://docs.z.ai/devpack/latest-model). The server-side default is still
    // GLM-4.7, so the newest model (GLM-5.2) is only used when explicitly pinned.
    // The `[1m]` suffix enables GLM's 1M-token context window.
    type: "settings",
    cmd: "claude-glm",
    displayName: "Claude Code (GLM / Z.AI)",
    lines: ["claude --dangerously-skip-permissions"],
    cmdAliases: ["claude-zai"],
    env: {
      ANTHROPIC_BASE_URL: "https://api.z.ai/api/anthropic",
      ANTHROPIC_AUTH_TOKEN: "${ZAI_API_KEY}",
      API_TIMEOUT_MS: "3000000",
      ANTHROPIC_DEFAULT_HAIKU_MODEL: "glm-4.5-air",
      ANTHROPIC_DEFAULT_SONNET_MODEL: "glm-5.2[1m]",
      ANTHROPIC_DEFAULT_OPUS_MODEL: "glm-5.2[1m]",
    },
    targets: [
      {
        kind: "json",
        scope: "global",
        filePath: "~/.claude/settings.json",
        merge: {
          sandbox: {
            enabled: false,
          },
        },
        description: "Global (~/.claude/settings.json) — disable sandbox",
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
    type: "settings",
    cmd: "opencode",
    displayName: "OpenCode",
    lines: ["opencode"],
    cmdAliases: ["opencode-yolo"],
    targets: [
      {
        kind: "json",
        scope: "project",
        filePath: "opencode.json",
        merge: {
          permission: {
            "*": {
              "*": "allow",
            },
          },
        },
        description: "Project (opencode.json)",
      },
    ],
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
