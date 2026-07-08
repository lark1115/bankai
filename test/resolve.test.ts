import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { resolveAgent, resolveAll } from "../src/registry/resolve.js";
import { saveCustomAgents } from "../src/registry/custom.js";

describe("resolveAgent", () => {
  let tmpFile: string;

  beforeEach(() => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bankai-test-"));
    tmpFile = path.join(dir, "agents.json");
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) {
      fs.rmSync(path.dirname(tmpFile), { recursive: true });
    }
  });

  it("resolves a builtin agent by cmd", () => {
    const agent = resolveAgent("claude", tmpFile);
    expect(agent).toBeDefined();
    expect(agent!.cmd).toBe("claude");
    expect(agent!.lines).toContain("claude --dangerously-skip-permissions");
  });

  it("resolves a builtin agent by alias", () => {
    const agent = resolveAgent("gemini-cli", tmpFile);
    expect(agent).toBeDefined();
    expect(agent!.cmd).toBe("gemini");
  });

  it("returns undefined for unknown cmd", () => {
    const agent = resolveAgent("nonexistent", tmpFile);
    expect(agent).toBeUndefined();
  });

  it("custom overrides builtin for same cmd", () => {
    saveCustomAgents(
      [
        {
          cmd: "claude",
          displayName: "My Claude",
          lines: ["claude --custom-flag"],
        },
      ],
      tmpFile,
    );

    const agent = resolveAgent("claude", tmpFile);
    expect(agent).toBeDefined();
    expect(agent!.displayName).toBe("My Claude");
    expect(agent!.lines).toEqual(["claude --custom-flag"]);
  });

  it("resolves opencode as settings type with permission targets", () => {
    const agent = resolveAgent("opencode", tmpFile);
    expect(agent).toBeDefined();
    expect(agent!.type).toBe("settings");
    expect(agent!.cmd).toBe("opencode");
    if (agent!.type === "settings") {
      expect(agent!.targets).toHaveLength(1);
      expect(agent!.targets[0].kind).toBe("json");
      expect(agent!.targets[0].filePath).toBe("opencode.json");
      expect(agent!.targets[0].merge).toEqual({
        permission: { "*": { "*": "allow" } },
      });
    }
  });

  it("resolves opencode-glm as settings type launching opencode with GLM", () => {
    const agent = resolveAgent("opencode-glm", tmpFile);
    expect(agent).toBeDefined();
    expect(agent!.type).toBe("settings");
    expect(agent!.cmd).toBe("opencode-glm");
    expect(agent!.lines).toEqual(["opencode --model zai-coding-plan/glm-5.2"]);
    if (agent!.type === "settings") {
      const global = agent!.targets.find((t) => t.scope === "global");
      expect(global).toBeDefined();
      expect(global!.kind).toBe("json");
      if (global!.kind === "json") {
        expect(global!.filePath).toBe("~/.config/opencode/opencode.json");
        expect(global!.merge).toEqual({
          provider: {
            "zai-coding-plan": {
              options: { apiKey: "{env:ZAI_API_KEY}" },
            },
          },
        });
      }
      const project = agent!.targets.find((t) => t.scope === "project");
      expect(project).toBeDefined();
      if (project!.kind === "json") {
        expect(project!.filePath).toBe("opencode.json");
        expect(project!.merge).toEqual({
          permission: { "*": { "*": "allow" } },
        });
      }
    }
  });

  it("resolves claude-glm and claude-zai aliases to opencode-glm", () => {
    for (const alias of ["claude-glm", "claude-zai"]) {
      const agent = resolveAgent(alias, tmpFile);
      expect(agent).toBeDefined();
      expect(agent!.cmd).toBe("opencode-glm");
    }
  });

  it("resolves opencode-yolo alias to opencode", () => {
    const agent = resolveAgent("opencode-yolo", tmpFile);
    expect(agent).toBeDefined();
    expect(agent!.cmd).toBe("opencode");
    expect(agent!.type).toBe("settings");
  });

  it("resolves custom agent alias", () => {
    saveCustomAgents(
      [
        {
          cmd: "myagent",
          lines: ["myagent --yolo"],
          cmdAliases: ["ma"],
        },
      ],
      tmpFile,
    );

    const agent = resolveAgent("ma", tmpFile);
    expect(agent).toBeDefined();
    expect(agent!.cmd).toBe("myagent");
  });
});

describe("resolveAll", () => {
  let tmpFile: string;

  beforeEach(() => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bankai-test-"));
    tmpFile = path.join(dir, "agents.json");
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) {
      fs.rmSync(path.dirname(tmpFile), { recursive: true });
    }
  });

  it("returns all builtins when no custom agents", () => {
    const all = resolveAll(tmpFile);
    expect(all.length).toBeGreaterThanOrEqual(5);
    expect(all.map((a) => a.cmd)).toContain("claude");
  });

  it("custom overrides builtin in merged list", () => {
    saveCustomAgents(
      [{ cmd: "claude", lines: ["claude --override"] }],
      tmpFile,
    );

    const all = resolveAll(tmpFile);
    const claude = all.find((a) => a.cmd === "claude");
    expect(claude!.lines).toEqual(["claude --override"]);
  });

  it("includes custom agents not in builtins", () => {
    saveCustomAgents(
      [{ cmd: "myagent", lines: ["myagent --go"] }],
      tmpFile,
    );

    const all = resolveAll(tmpFile);
    expect(all.map((a) => a.cmd)).toContain("myagent");
  });
});
