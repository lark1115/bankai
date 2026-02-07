# bankai

CLI tool that launches coding agent CLIs with approval-bypass flags.

## Requirements

- Node.js >= 20.12.0

## Install

```bash
bun install -g bankai-cli
```

## Usage

```bash
# Launch a specific agent with bypass flags
bankai claude

# Interactive agent picker
bankai

# List all supported agents
bankai agents

# List only agents installed on your system
bankai agents --installed
```

## Supported Agents

### CLI Agents (flag output)

| Agent | Command | Docs |
|-------|---------|------|
| Claude Code | `claude --dangerously-skip-permissions` | [Settings - Claude Code Docs](https://code.claude.com/docs/en/settings) |
| Codex CLI | `codex --dangerously-bypass-approvals-and-sandbox` | [CLI Reference - OpenAI Codex](https://developers.openai.com/codex/cli/reference/) |
| GitHub Copilot CLI | `copilot --allow-all-tools` | [Copilot CLI Docs](https://docs.github.com/en/copilot) |
| Gemini CLI | `gemini --yolo` | [Configuration - Gemini CLI](https://github.com/google-gemini/gemini-cli/blob/main/docs/get-started/configuration.md) |
| OpenHands | `openhands --always-approve` | [CLI Mode - OpenHands Docs](https://docs.openhands.dev/openhands/usage/run-openhands/cli-mode) |
| Aider | `aider --yes-always` | [Options Reference - aider](https://aider.chat/docs/config/options.html) |
| Qwen Code | `qwen-code --yolo` | [Approval Mode - Qwen Code Docs](https://qwenlm.github.io/qwen-code-docs/en/users/features/approval-mode/) |
| Kimi Code | `kimi --yolo` | [Interaction Guide - Kimi Code Docs](https://www.kimi.com/code/docs/en/kimi-cli/guides/interaction.html) |

### Settings Agents (config file / DB modification)

| Agent | Target | Description |
|-------|--------|-------------|
| Cursor Agent CLI | `.cursor/cli.json` / `~/.cursor/cli-config.json` | Writes permission allow-list for Cursor Agent CLI |
| Cursor IDE | SQLite DB (`state.vscdb`) | Applies settings below, then launches Cursor |

#### Cursor IDE (`bankai cursor`)

Unlike CLI agents that pass a flag, Cursor IDE stores its settings in a SQLite DB. `bankai cursor` modifies the DB directly to apply the following, then opens Cursor:

| Setting | Effect |
|---------|--------|
| Auto-Run Mode → Run Everything (Unsandboxed) | Agent runs all commands without sandboxing |
| Browser Protection → OFF | Agent can run browser tools automatically |
| MCP Tools Protection → OFF | Agent can run MCP tools automatically |
| File-Deletion Protection → OFF | Agent can delete files automatically |
| External-File Protection → OFF | Agent can create/modify files outside the workspace |
| Dot-files Protection → OFF | Agent can modify dotfiles (.env, etc.) |

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

## Development

```bash
bun install
bun run dev -- claude    # Run from source
bun run build            # Build to dist/
bun run test             # Run tests
```
