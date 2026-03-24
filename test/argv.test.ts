import { describe, expect, it } from "vitest";
import { extractDirectAgentInvocation } from "../src/argv.js";

describe("extractDirectAgentInvocation", () => {
  it("passes through option-like args after positional agent cmd", () => {
    expect(
      extractDirectAgentInvocation([
        "codex",
        "-C",
        "/Volumes/FX700/workspace/github.com/ryde-inc/ryde-pass-app",
      ]),
    ).toEqual({
      cmd: "codex",
      extraArgs: ["-C", "/Volumes/FX700/workspace/github.com/ryde-inc/ryde-pass-app"],
    });
  });

  it("supports -- separator and strips it once", () => {
    expect(extractDirectAgentInvocation(["codex", "--", "-h"])).toEqual({
      cmd: "codex",
      extraArgs: ["-h"],
    });
  });

  it("supports -a / --agent forms", () => {
    expect(extractDirectAgentInvocation(["-a", "codex", "--cd", "/tmp"])).toEqual({
      cmd: "codex",
      extraArgs: ["--cd", "/tmp"],
    });

    expect(extractDirectAgentInvocation(["--agent=codex", "-h"])).toEqual({
      cmd: "codex",
      extraArgs: ["-h"],
    });
  });

  it("does not hijack top-level help/version, commands, or unknown options", () => {
    expect(extractDirectAgentInvocation(["-h"])).toBeNull();
    expect(extractDirectAgentInvocation(["--version"])).toBeNull();
    expect(extractDirectAgentInvocation(["agents", "--installed"])).toBeNull();
    expect(extractDirectAgentInvocation(["--foo", "codex"])).toBeNull();
  });
});
