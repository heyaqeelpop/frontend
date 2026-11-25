export type AgentStatus = "Pending" | "Running" | "Completed" | "Failed";
export type Algorithm = "Priority" | "Round Robin" | "Fixed Quota" | "PPO v2";
export interface Agent {
  id: string;
  task: string;
  cpu: number;
  ram: number;
  tokens: number;
  priority: number;
  deadline: number;
  duration: number;
  status: AgentStatus;
  history: string[];
}
export interface Configuration {
  count: number;
  min: number;
  max: number;
  seed: number;
  cpu: number;
  ram: number;
  tokens: number;
  mode: "Random" | "Sample";
  speed: number;
}
export const defaults: Configuration = {
  count: 12,
  min: 5,
  max: 20,
  seed: 42,
  cpu: 16,
  ram: 32,
  tokens: 24000,
  mode: "Random",
  speed: 1,
};
export const taskNames = [
  "Document summarization",
  "Code generation",
  "Data analysis",
  "Research synthesis",
  "Image classification",
  "Sentiment analysis",
  "Content generation",
  "Language translation",
  "Knowledge retrieval",
  "Workflow automation",
  "Quality evaluation",
  "Report generation",
];
export function generateAgents(config: Configuration, initial = false): Agent[] {
  let seed = config.mode === "Sample" ? 42 : config.seed;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const count = Math.max(1, Math.min(20, config.count));
  return Array.from({ length: count }, (_, i) => {
    const status: AgentStatus = initial
      ? i < 5
        ? "Completed"
        : i < 8
          ? "Running"
          : i === 11
            ? "Failed"
            : "Pending"
      : "Pending";
    return {
      id: `A${String(i + 1).padStart(3, "0")}`,
      task: taskNames[i % taskNames.length] ?? "Agent task",
      cpu: 1 + Math.floor(random() * 3),
      ram: 2 + Math.floor(random() * 5),
      tokens: 600 + Math.floor(random() * 1200),
      priority: 1 + Math.floor(random() * 5),
      deadline: 15 + Math.floor(random() * 45),
      duration: status === "Completed" ? 4 + Math.floor(random() * 12) : 0,
      status,
      history: [
        "Agent created and added to workload",
        ...(status !== "Pending"
          ? [
              "Resources requested",
              status === "Completed"
                ? "Execution completed successfully"
                : status === "Running"
                  ? "Resources allocated · execution started"
                  : "Deadline expired · resources released",
            ]
          : []),
      ],
    };
  });
}
export function getResources(agents: Agent[], config: Configuration) {
  const running = agents.filter((a) => a.status === "Running");
  const cpu = Math.min(
    config.cpu,
    running.reduce((n, a) => n + a.cpu, 0),
  );
  const ram = Math.min(
    config.ram,
    running.reduce((n, a) => n + a.ram, 0),
  );
  const tokens = Math.min(
    config.tokens,
    agents.reduce(
      (n, a) =>
        n +
        (a.status === "Completed"
          ? a.tokens
          : a.status === "Running"
            ? Math.round(a.tokens * 0.35)
            : 0),
      0,
    ),
  );
  return {
    cpu,
    ram,
    tokens,
    cpuPercent: Math.round((cpu / config.cpu) * 100),
    ramPercent: Math.round((ram / config.ram) * 100),
    tokenPercent: Math.round((tokens / config.tokens) * 100),
  };
}
export function simulationStep(agents: Agent[], tick: number, algorithm: Algorithm): Agent[] {
  const running = agents.find((a) => a.status === "Running");
  const queue = agents.filter((a) => a.status === "Pending");
  if (algorithm === "Priority") queue.sort((a, b) => b.priority - a.priority);
  const next = queue[0];
  return agents.map((a) => {
    if (running?.id === a.id) {
      const failed = tick % 7 === 0;
      return {
        ...a,
        status: failed ? "Failed" : "Completed",
        duration: tick * 2,
        history: [
          ...a.history,
          failed ? "Simulated deadline expired" : "Simulated execution completed",
        ],
      };
    }
    if (next?.id === a.id)
      return {
        ...a,
        status: "Running",
        history: [...a.history, `${algorithm} selected agent · resources allocated (simulated)`],
      };
    return a;
  });
}
export const algorithms: Algorithm[] = ["Priority", "Round Robin", "Fixed Quota", "PPO v2"];
export const algorithmDescriptions: Record<Algorithm, string> = {
  Priority: "Higher-priority agents are scheduled first.",
  "Round Robin": "Agents share execution time in rotating time slices.",
  "Fixed Quota": "Each agent receives a predefined resource allowance.",
  "PPO v2":
    "Illustrates policy-based allocation with predefined demo behavior. No model inference.",
};
export const comparison = [
  {
    algorithm: "Priority",
    completed: 5.3,
    failed: 6.9,
    completion: 46.5,
    makespan: 46.7,
    cpu: 40.8,
    ram: 38.0,
    tokens: 9988,
  },
  {
    algorithm: "Round Robin",
    completed: 5.3,
    failed: 6.9,
    completion: 45.6,
    makespan: 50.2,
    cpu: 31.9,
    ram: 32.0,
    tokens: 10024,
  },
  {
    algorithm: "Fixed Quota",
    completed: 5.6,
    failed: 6.6,
    completion: 47.9,
    makespan: 47.0,
    cpu: 41.6,
    ram: 34.8,
    tokens: 9926,
  },
  {
    algorithm: "PPO v2",
    completed: 3.2,
    failed: 9.0,
    completion: 27.5,
    makespan: 47.4,
    cpu: 26.0,
    ram: 21.0,
    tokens: 5876,
  },
];
export const history = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`,
  cpu:
    [
      24, 29, 26, 38, 32, 46, 42, 52, 48, 58, 44, 56, 51, 61, 49, 56, 48, 62, 56, 65, 53, 58, 51,
      56,
    ][i] ?? 50,
  ram:
    [
      18, 23, 21, 28, 27, 34, 32, 38, 36, 43, 40, 46, 41, 48, 42, 45, 41, 50, 46, 53, 47, 51, 48,
      50,
    ][i] ?? 40,
  completed: 1 + (i % 4),
  failed: i % 6 === 0 ? 1 : 0,
}));
export const initialEvents = [
  { time: "11:42:38", agent: "A006", text: "CPU and RAM resources allocated", type: "Running" },
  {
    time: "11:42:35",
    agent: "A005",
    text: "Agent execution completed successfully",
    type: "Completed",
  },
  { time: "11:42:31", agent: "A009", text: "Agent entered the waiting queue", type: "Pending" },
  {
    time: "11:42:28",
    agent: "A012",
    text: "Deadline expired · resources released",
    type: "Failed",
  },
  { time: "11:42:24", agent: "A008", text: "Priority scheduler selected agent", type: "Running" },
];
export const reports = Array.from({ length: 16 }, (_, i) => ({
  id: `EXP-${String(128 - i).padStart(4, "0")}`,
  date: `2026-11-${String(25 - Math.floor(i / 2)).padStart(2, "0")}`,
  algorithm: algorithms[i % 4] ?? "Priority",
  workload: i % 3 === 0 ? "Sample" : "Random",
  agents: 12 + (i % 9),
  completion: comparison[i % 4]?.completion ?? 46.5,
  cpu: comparison[i % 4]?.cpu ?? 40.8,
  ram: comparison[i % 4]?.ram ?? 38,
  tokens: comparison[i % 4]?.tokens ?? 9988,
  status: i % 7 === 0 ? "Interrupted" : "Completed",
}));
export function toCSV(rows: Record<string, string | number>[]): string {
  const first = rows[0];
  if (!first) return "";
  const keys = Object.keys(first);
  const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  return [
    keys.map(escape).join(","),
    ...rows.map((row) => keys.map((key) => escape(row[key] ?? "")).join(",")),
  ].join("\r\n");
}
