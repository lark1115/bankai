# bankai

```bash
                                       ▗▄▄▄▖
                                        ████▖▄▄▄▄             ▄▄▄
▗█▙▄▄▄▄▄▄▄▄▄▄▄▄▄      ▗▄▄             ▗▟██████████▄▝██████████████▙▄
▝▜█████████████▀▘     ▝████▖        ▗▟██▛▘  ▗███▀▘   ▀▀▜██▛▘  ▐███▀▀▘
            ▜██▛        ▐███       ▄▟██▛▘   ▗███▘       ▐██▌   ▐███
            ▐██▌        ▐███       ▀▀▀▘    ▗███▙▄▄▄▖   ▗██▛▗▄ ▗███▌
            ▐██▌        ▐███       ▗▟█████████▀▀█████▖▗██▘ ▝██████
            ▐██▌        ███▌        ▝███▌  ██▌  ████▀▄▟█  ▜███▀▀▀
▗▄▄▄▄▄▄▄▄▄▄▄▟██▙▄▄▄▄▄▄█████         ▐██▙▄▄██▙▄▄███▌ ▐██▙▄▄███▙▄▄██▙▖
█████████▀▀▀▜██▛▀▀▀▀▀▀▀▀▜██          ▝███▀▀██▛▀▀███  ▟██▀▀▀▜██▛▀▀▀▀▀▘
 ███▌       ▐██▌                     ▐██▌  ██▌  ███ ▟██▘   ▐██▌
 ███▌       ▐██▌                     ▐██▙▄▄████▙███▗██▄▄▄▄▄▟█████████▄
 ███▌       ▐██▌                     ██▛▀▀▀▀    ▐██▌▀███▛▀▀▜██▛▀▀▀▀▀▀▀
 ███▌       ▐██▌                    ▗██▘        ▐██▌       ▐██▌
▗███▘      ▗███▙▄▄▄▄▄▄▄▄▄▄          ▟█▛   ▗▄▄▖  ███▌       ▝██▌
▐███       ▜███████████████▙       ▗██▘    ▀███████▌        ██▌
  ▀▀         ▀▀                    ▀▀▘       ▝▀████▘        ██▘



```

[![npm version](https://img.shields.io/npm/v/bankai-cli)](https://www.npmjs.com/package/bankai-cli)
[![CI](https://github.com/lark1115/bankai/actions/workflows/ci.yml/badge.svg)](https://github.com/lark1115/bankai/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.12.0-brightgreen)](https://nodejs.org/)
[![Open in Visual Studio Code](https://img.shields.io/static/v1?logo=visualstudiocode&label=&message=Open%20in%20Visual%20Studio%20Code&labelColor=2c2c32&color=007acc&logoColor=007acc)](https://open.vscode.dev/lark1115/bankai)

CLI tool that launches coding agent CLIs with approval-bypass flags.

## Requirements

- Node.js >= 20.12.0

## Install

```bash
npm install -g bankai-cli
# or: pnpm add -g bankai-cli
# or: bun install -g bankai-cli
```

## Usage

```bash
# Launch a specific agent with bypass flags
bankai claude

# Pass args directly to the target agent
bankai codex -C /path/to/project

# Interactive agent picker
bankai

# List all supported agents
bankai agents

# List only agents installed on your system
bankai agents --installed
```

## Supported Agents

### CLI Agents (flag output)

| Agent              | Command                                            | Docs                                                                                                                  |
| ------------------ | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Claude Code        | `claude --dangerously-skip-permissions`            | [Settings - Claude Code Docs](https://code.claude.com/docs/en/settings)                                               |
| Codex CLI          | `codex --dangerously-bypass-approvals-and-sandbox` | [CLI Reference - OpenAI Codex](https://developers.openai.com/codex/cli/reference/)                                    |
| GitHub Copilot CLI | `copilot --allow-all-tools`                        | [Copilot CLI Docs](https://docs.github.com/en/copilot)                                                                |
| Gemini CLI         | `gemini --yolo`                                    | [Configuration - Gemini CLI](https://github.com/google-gemini/gemini-cli/blob/main/docs/get-started/configuration.md) |
| OpenHands          | `openhands --always-approve`                       | [CLI Mode - OpenHands Docs](https://docs.openhands.dev/openhands/usage/run-openhands/cli-mode)                        |
| Aider              | `aider --yes-always`                               | [Options Reference - aider](https://aider.chat/docs/config/options.html)                                              |
| Qwen Code          | `qwen-code --yolo`                                 | [Approval Mode - Qwen Code Docs](https://qwenlm.github.io/qwen-code-docs/en/users/features/approval-mode/)            |
| Kimi Code          | `kimi --yolo`                                      | [Interaction Guide - Kimi Code Docs](https://www.kimi.com/code/docs/en/kimi-cli/guides/interaction.html)              |

### Settings Agents (config file / DB modification)

| Agent            | Target                                           | Description                                                            |
| ---------------- | ------------------------------------------------ | --------------------------------------------------------------------- |
| OpenCode (GLM)   | `~/.config/opencode/opencode.json` / `opencode.json` | `bankai opencode-glm` — OpenCode on Z.AI's GLM models (see [Env Vars](#env-vars)) |
| Cursor Agent CLI | `.cursor/cli.json` / `~/.cursor/cli-config.json` | Writes permission allow-list for Cursor Agent CLI                     |
| Cursor IDE       | SQLite DB (`state.vscdb`)                        | Applies settings below, then launches Cursor                          |

#### Cursor IDE (`bankai cursor`)

Unlike CLI agents that pass a flag, Cursor IDE stores its settings in a SQLite DB. `bankai cursor` modifies the DB directly to apply the following, then opens Cursor:

| Setting                                      | Effect                                              |
| -------------------------------------------- | --------------------------------------------------- |
| Auto-Run Mode → Run Everything (Unsandboxed) | Agent runs all commands without sandboxing          |
| Browser Protection → OFF                     | Agent can run browser tools automatically           |
| MCP Tools Protection → OFF                   | Agent can run MCP tools automatically               |
| File-Deletion Protection → OFF               | Agent can delete files automatically                |
| External-File Protection → OFF               | Agent can create/modify files outside the workspace |
| Dot-files Protection → OFF                   | Agent can modify dotfiles (.env, etc.)              |

Cursor must be restarted after the first apply for changes to take effect.

## Custom Agents

Register agents not in the built-in list:

```bash
# Non-interactive
bankai add --cmd opencode --line "opencode --yolo"

# Interactive
bankai add

# Edit an existing custom agent
bankai edit opencode

# Remove a custom agent
bankai remove opencode
```

Custom agents are stored in `~/.config/bankai/agents.json` (XDG-compliant, varies by OS).

## Env Vars

Any agent (built-in or custom) may define an `env` map that is injected into the
agent process at launch — useful for pointing a tool at an alternate, API-compatible
backend without editing its config files or maintaining shell aliases.

Values support `${VAR}` interpolation against your current environment, so **secrets
never need to be written into the agent definition**. A `${VAR}` that is unset
resolves to an empty string and prints a warning. Literal values pass through unchanged.

### OpenCode on GLM (Z.AI)

`bankai opencode-glm` launches [OpenCode](https://opencode.ai) against Z.AI's GLM
Coding Plan endpoint (provider `zai-coding-plan`, see [models.dev](https://models.dev)),
pinning the model per launch:

```bash
opencode --model zai-coding-plan/glm-5.2
```

The provider is configured in your global OpenCode config
(`~/.config/opencode/opencode.json`) with an env placeholder — **the key itself is
never written to disk**; OpenCode resolves it from your shell at runtime:

```jsonc
{
  "provider": {
    "zai-coding-plan": {
      "options": { "apiKey": "{env:ZAI_API_KEY}" }
    }
  }
}
```

Set your key once, then run:

```bash
export ZAI_API_KEY="your-z.ai-api-key"   # or source it from a secret manager
bankai opencode-glm                      # aliases: claude-glm, claude-zai
```

Because the model is passed via `--model` (not written into config), plain `opencode`
runs in the same project keep their own default model. To use a different GLM model,
register a custom agent that overrides `opencode-glm` with your own launch line.

## Development

```bash
bun install
bun run dev -- claude    # Run from source
bun run build            # Build to dist/
bun run test             # Run tests
```
