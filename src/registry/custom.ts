import fs from "node:fs";
import path from "node:path";
import envPaths from "env-paths";
import { CustomAgentsFileSchema, type CustomAgentDef } from "./types.js";

const paths = envPaths("bankai");
const agentsFile = path.join(paths.config, "agents.json");

function ensureConfigDir(): void {
  fs.mkdirSync(paths.config, { recursive: true });
}

export function loadCustomAgents(filePath = agentsFile): CustomAgentDef[] {
  if (!fs.existsSync(filePath)) return [];
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return CustomAgentsFileSchema.parse(raw);
}

export function saveCustomAgents(
  agents: CustomAgentDef[],
  filePath = agentsFile,
): void {
  if (filePath === agentsFile) ensureConfigDir();
  fs.writeFileSync(filePath, JSON.stringify(agents, null, 2) + "\n");
}

export function addAgent(
  agent: CustomAgentDef,
  filePath = agentsFile,
): void {
  const agents = loadCustomAgents(filePath);
  const existing = agents.findIndex((a) => a.cmd === agent.cmd);
  if (existing !== -1) {
    throw new Error(`Agent "${agent.cmd}" already exists. Use edit to update.`);
  }
  agents.push(agent);
  saveCustomAgents(agents, filePath);
}

export function updateAgent(
  cmd: string,
  updates: Partial<Omit<CustomAgentDef, "cmd">>,
  filePath = agentsFile,
): void {
  const agents = loadCustomAgents(filePath);
  const idx = agents.findIndex((a) => a.cmd === cmd);
  if (idx === -1) {
    throw new Error(`Agent "${cmd}" not found.`);
  }
  agents[idx] = { ...agents[idx], ...updates };
  saveCustomAgents(agents, filePath);
}

export function removeAgent(cmd: string, filePath = agentsFile): void {
  const agents = loadCustomAgents(filePath);
  const filtered = agents.filter((a) => a.cmd !== cmd);
  if (filtered.length === agents.length) {
    throw new Error(`Agent "${cmd}" not found.`);
  }
  saveCustomAgents(filtered, filePath);
}
