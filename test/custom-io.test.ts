import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  loadCustomAgents,
  saveCustomAgents,
  addAgent,
  updateAgent,
  removeAgent,
} from "../src/registry/custom.js";

describe("custom agent I/O", () => {
  let tmpDir: string;
  let tmpFile: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bankai-test-"));
    tmpFile = path.join(tmpDir, "agents.json");
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("returns empty array when file does not exist", () => {
    const agents = loadCustomAgents(tmpFile);
    expect(agents).toEqual([]);
  });

  it("saves and loads agents", () => {
    const agents = [{ cmd: "test", lines: ["test --go"] }];
    saveCustomAgents(agents, tmpFile);
    const loaded = loadCustomAgents(tmpFile);
    expect(loaded).toEqual(agents);
  });

  it("addAgent appends a new agent", () => {
    addAgent({ cmd: "foo", lines: ["foo --yes"] }, tmpFile);
    addAgent({ cmd: "bar", lines: ["bar --yolo"] }, tmpFile);
    const loaded = loadCustomAgents(tmpFile);
    expect(loaded).toHaveLength(2);
    expect(loaded.map((a) => a.cmd)).toEqual(["foo", "bar"]);
  });

  it("addAgent throws on duplicate cmd", () => {
    addAgent({ cmd: "foo", lines: ["foo --yes"] }, tmpFile);
    expect(() => addAgent({ cmd: "foo", lines: ["foo --other"] }, tmpFile)).toThrow(
      /already exists/,
    );
  });

  it("updateAgent modifies an existing agent", () => {
    addAgent({ cmd: "foo", lines: ["foo --old"] }, tmpFile);
    updateAgent("foo", { lines: ["foo --new"] }, tmpFile);
    const loaded = loadCustomAgents(tmpFile);
    expect(loaded[0].lines).toEqual(["foo --new"]);
  });

  it("updateAgent throws on unknown agent", () => {
    expect(() => updateAgent("nope", { lines: ["x"] }, tmpFile)).toThrow(
      /not found/,
    );
  });

  it("removeAgent deletes an agent", () => {
    addAgent({ cmd: "foo", lines: ["foo --yes"] }, tmpFile);
    addAgent({ cmd: "bar", lines: ["bar --yes"] }, tmpFile);
    removeAgent("foo", tmpFile);
    const loaded = loadCustomAgents(tmpFile);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].cmd).toBe("bar");
  });

  it("removeAgent throws on unknown agent", () => {
    expect(() => removeAgent("nope", tmpFile)).toThrow(/not found/);
  });

  it("rejects invalid data on load", () => {
    fs.writeFileSync(tmpFile, JSON.stringify([{ cmd: "", lines: [] }]));
    expect(() => loadCustomAgents(tmpFile)).toThrow();
  });
});
