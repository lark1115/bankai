import { spawnSync } from "node:child_process";
import type { AgentDef } from "./registry/types.js";

export function isInstalled(cmd: string): boolean {
  const result = spawnSync("command", ["-v", cmd], {
    shell: true,
    stdio: "ignore",
  });
  return result.status === 0;
}

export function filterInstalled(agents: AgentDef[]): AgentDef[] {
  return agents.filter((a) => isInstalled(a.cmd));
}
