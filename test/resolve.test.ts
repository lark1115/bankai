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
