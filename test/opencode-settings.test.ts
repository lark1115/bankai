import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  isJsonAlreadyApplied,
  applyJsonSettings,
  deepMerge,
} from "../src/settings.js";
import type { JsonTarget } from "../src/registry/types.js";

const opencodeTarget: JsonTarget = {
  kind: "json",
  scope: "project",
  filePath: "", // set in beforeEach
  merge: {
    permission: {
      "*": {
        "*": "allow",
      },
    },
  },
  description: "Project (opencode.json)",
};

describe("opencode settings integration", () => {
  let tmpDir: string;
  let target: JsonTarget;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bankai-oc-test-"));
    target = { ...opencodeTarget, filePath: path.join(tmpDir, "opencode.json") };
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("isAlreadyApplied returns false for missing file", () => {
    expect(isJsonAlreadyApplied(target)).toBe(false);
  });

  it("creates opencode.json when it does not exist", () => {
    applyJsonSettings(target);
    expect(fs.existsSync(target.filePath)).toBe(true);
    const data = JSON.parse(fs.readFileSync(target.filePath, "utf-8"));
    expect(data.permission).toEqual({ "*": { "*": "allow" } });
  });

  it("isAlreadyApplied returns true after apply", () => {
    applyJsonSettings(target);
    expect(isJsonAlreadyApplied(target)).toBe(true);
  });

  it("preserves existing keys via deep merge", () => {
    const existing = {
      $schema: "https://opencode.ai/config.json",
      mcp: { notion: { type: "remote", url: "https://mcp.notion.com/mcp" } },
    };
    fs.writeFileSync(target.filePath, JSON.stringify(existing, null, 2));

    applyJsonSettings(target);

    const data = JSON.parse(fs.readFileSync(target.filePath, "utf-8"));
    expect(data.$schema).toBe("https://opencode.ai/config.json");
    expect(data.mcp.notion.url).toBe("https://mcp.notion.com/mcp");
    expect(data.permission).toEqual({ "*": { "*": "allow" } });
  });

  it("is idempotent — applying twice produces same result", () => {
    applyJsonSettings(target);
    const first = fs.readFileSync(target.filePath, "utf-8");

    applyJsonSettings(target);
    const second = fs.readFileSync(target.filePath, "utf-8");

    expect(first).toBe(second);
  });

  it("overwrites invalid JSON", () => {
    fs.writeFileSync(target.filePath, "{ broken json");

    applyJsonSettings(target);

    const data = JSON.parse(fs.readFileSync(target.filePath, "utf-8"));
    expect(data.permission).toEqual({ "*": { "*": "allow" } });
  });
});

describe("deepMerge for opencode permission", () => {
  it("merges permission into existing config", () => {
    const base = { mcp: { notion: { type: "remote" } } };
    const overlay = { permission: { "*": { "*": "allow" } } };
    const result = deepMerge(base, overlay);
    expect(result.mcp).toEqual({ notion: { type: "remote" } });
    expect(result.permission).toEqual({ "*": { "*": "allow" } });
  });

  it("does not clobber existing permission rules", () => {
    const base = { permission: { "bash": { "rm": "deny" } } };
    const overlay = { permission: { "*": { "*": "allow" } } };
    const result = deepMerge(base, overlay);
    expect((result.permission as Record<string, unknown>)["bash"]).toEqual({ "rm": "deny" });
    expect((result.permission as Record<string, unknown>)["*"]).toEqual({ "*": "allow" });
  });
});
