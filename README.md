# bankai

CLI tool that prints approval-bypass startup commands for coding agent CLIs.

bankai does **not** execute the agents — it only outputs the commands for copy-paste.

## Install

```bash
bun install -g bankai-cli
```

## Usage

```bash
# Print bypass command for a specific agent
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
| Cursor IDE | SQLite DB (`state.vscdb`) | Enables Auto-Run Mode, disables protections (requires restart) |

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
