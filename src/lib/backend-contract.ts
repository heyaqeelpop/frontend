/**
 * Data contract for the future FastAPI backend.
 * Nothing here performs network requests. The shapes describe what the UI
 * expects to receive; the `apply*` functions in the resource provider accept them.
 */
import type { AgentStatus, Algorithm } from "@/lib/demo";

/** Where a value on screen comes from. */
export type DataSource = "historical" | "demo" | "live";

export const dataSourceLabels: Record<DataSource, string> = {
  historical: "HISTORICAL",
  demo: "DEMO",
  live: "LIVE BACKEND",
};

export type SimulationStatus = "Idle" | "Running" | "Paused" | "Completed";

export interface BackendAgentState {
  id: string;
  status: AgentStatus;
  cpu?: number;
  ram?: number;
  tokens?: number;
  duration?: number;
}

export interface BackendEvent {
  time: string;
  agent: string;
  text: string;
  type: string;
}

/** One response from the backend simulation endpoint. */
export interface SimulationSnapshot {
  status: SimulationStatus;
  algorithm: Algorithm;
  /** Current simulation time in seconds. */
  time: number;
  agents: BackendAgentState[];
  allocation: { cpu: number; ram: number; tokens: number };
  completed: number;
  failed: number;
  events: BackendEvent[];
}

export type ComparisonResult = {
  algorithm: string;
  completed: number;
  failed: number;
  completion: number;
  makespan: number;
  cpu: number;
  ram: number;
  tokens: number;
};

export interface DeadlockReport {
  cycles: string[][];
  agents: string[];
  victim: string | null;
  action: string;
  released: { cpu: number; ram: number };
}

export interface ExperimentResult {
  id: string;
  date: string;
  algorithm: string;
  workload: string;
  agents: number;
  completion: number;
  cpu: number;
  ram: number;
  tokens: number;
  status: string;
}

/** Latest trained PPO model (reported training run). */
export const latestPpoModel = {
  version: "PPO V5",
  observationSpace: 165,
  actionSpace: 21,
  actionDetail: "20 agent selections + 1 skip action",
  timesteps: 300_032,
  seed: 42,
  file: "ppo_resource_manager_v5.zip",
  evaluation: { episodes: 100, seed: 20000, completionRate: 43.1, meanReward: -8.93 },
} as const;
