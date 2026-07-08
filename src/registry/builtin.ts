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
    // OpenCode pointed at Z.AI's GLM Coding Plan endpoint (OpenAI-compatible,
    // provider id "zai-coding-plan" per https://models.dev). The API key is
    // NOT stored here — set ZAI_API_KEY in your shell (or sops); opencode
    // resolves the {env:ZAI_API_KEY} placeholder from the environment at
    // runtime.
    //
    // The model is pinned per launch via --model rather than written into
    // config, so plain `opencode` runs in the same project keep their own
    // default model.
    type: "settings",
    cmd: "opencode-glm",
    displayName: "OpenCode (GLM / Z.AI)",
    lines: ["opencode --model zai-coding-plan/glm-5.2"],
    cmdAliases: ["claude-glm", "claude-zai"],
    targets: [
      {
        kind: "json",
        scope: "global",
        filePath: "~/.config/opencode/opencode.json",
        merge: {
          provider: {
            "zai-coding-plan": {
              options: {
                apiKey: "{env:ZAI_API_KEY}",
              },
            },
          },
        },
        description:
          "Global (~/.config/opencode/opencode.json) — Z.AI provider, key read from env",
      },
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
