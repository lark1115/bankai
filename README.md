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

### OpenCode Console (formerly Zen)

OpenCode is optional and should only be selected when the requester explicitly
asks for it. No Zen-specific builtin is wired in this release: a provider/model
must not be inferred from an existing OpenCode config. The generic `opencode`
builtin is unchanged and does not select or authenticate Console/Zen for you.

The local CLI checked for this change was OpenCode v2.0.24. Its TUI supports
`--auto` (auto-approve except explicit denies); `opencode run` supports
`--model provider/model#variant` and `--agent`. Those model/agent flags are not
listed by the v2 TUI help. Verify a dedicated persistent worker launch path and
Console authentication before adding a Zen builtin. No real agent or paid model
request was started for this change.

See the official [Console model/auth guide](https://opencode.ai/v2/docs/console/models/),
[V2 configuration](https://opencode.ai/v2/docs/config/), and
[permissions](https://opencode.ai/v2/docs/permissions/).

## Development

```bash
bun install
bun run dev -- claude    # Run from source
bun run build            # Build to dist/
bun run test             # Run tests
```
