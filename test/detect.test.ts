import { describe, it, expect, vi, beforeEach } from "vitest";
import * as child_process from "node:child_process";
import { isInstalled, filterInstalled } from "../src/detect.js";
import type { AgentDef } from "../src/registry/types.js";

vi.mock("node:child_process", () => ({
  spawnSync: vi.fn(),
}));

const mockedSpawnSync = vi.mocked(child_process.spawnSync);

describe("isInstalled", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when command exists", () => {
    mockedSpawnSync.mockReturnValue({ status: 0 } as any);
    expect(isInstalled("node")).toBe(true);
    expect(mockedSpawnSync).toHaveBeenCalledWith("command", ["-v", "node"], {
      shell: true,
      stdio: "ignore",
    });
  });

  it("returns false when command does not exist", () => {
    mockedSpawnSync.mockReturnValue({ status: 1 } as any);
    expect(isInstalled("nonexistent-cmd-xyz")).toBe(false);
  });
});

describe("filterInstalled", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filters to only installed agents", () => {
    mockedSpawnSync.mockImplementation((_cmd, args) => {
      const name = (args as string[])[1];
      return { status: name === "yes-cmd" ? 0 : 1 } as any;
    });

    const agents: AgentDef[] = [
      { cmd: "yes-cmd", lines: ["yes-cmd --go"] },
      { cmd: "no-cmd", lines: ["no-cmd --go"] },
    ];

    const result = filterInstalled(agents);
    expect(result).toHaveLength(1);
    expect(result[0].cmd).toBe("yes-cmd");
  });
});
