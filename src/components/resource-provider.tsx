import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import {
  defaults,
  generateAgents,
  getResources,
  initialEvents,
  simulationStep,
  type Agent,
  type Algorithm,
  type Configuration,
} from "@/lib/demo";
import type {
  ComparisonResult,
  DataSource,
  DeadlockReport,
  ExperimentResult,
  SimulationSnapshot,
} from "@/lib/backend-contract";

function useDemoState() {
  const [config, setConfig] = useState<Configuration>({ ...defaults });
  const [agents, setAgents] = useState<Agent[]>(() => generateAgents(defaults, true));
  const [algorithm, setAlgorithm] = useState<Algorithm>("Priority");
  const [simulation, setSimulation] = useState<"Idle" | "Running" | "Paused" | "Completed">("Idle");
  const [tick, setTick] = useState(0);
  const [limit, setLimit] = useState(60);
  const [events, setEvents] = useState(initialEvents);
  const [monitoring, setMonitoring] = useState(false);
  const [resourceHistory, setResourceHistory] = useState<
    { time: string; cpu: number; ram: number }[]
  >([]);
  const [theme, setTheme] = useState<"Dark" | "Light">("Dark");
  const [workloadVersion, setWorkloadVersion] = useState(1);
  const tickRef = useRef(0);
  // Backend-ready slots. They stay empty until the FastAPI backend is connected.
  const [dataSource, setDataSource] = useState<DataSource>("demo");
  const [liveSnapshot, setLiveSnapshot] = useState<SimulationSnapshot | null>(null);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[] | null>(null);
  const [deadlockReport, setDeadlockReport] = useState<DeadlockReport | null>(null);
  const [experimentResults, setExperimentResults] = useState<ExperimentResult[] | null>(null);
  const demoResources = getResources(agents, config);
  const resources = liveSnapshot
    ? {
        cpu: liveSnapshot.allocation.cpu,
        ram: liveSnapshot.allocation.ram,
        tokens: liveSnapshot.allocation.tokens,
        cpuPercent: Math.round((liveSnapshot.allocation.cpu / config.cpu) * 100),
        ramPercent: Math.round((liveSnapshot.allocation.ram / config.ram) * 100),
        tokenPercent: Math.round((liveSnapshot.allocation.tokens / config.tokens) * 100),
      }
    : demoResources;
  const elapsed = liveSnapshot ? liveSnapshot.time : tick * 2;
  const applySimulationSnapshot = (snapshot: SimulationSnapshot) => {
    setLiveSnapshot(snapshot);
    setDataSource("live");
    setSimulation(snapshot.status);
    setAlgorithm(snapshot.algorithm);
    setAgents((current) =>
      current.map((a) => {
        const update = snapshot.agents.find((b) => b.id === a.id);
        return update ? { ...a, ...update } : a;
      }),
    );
    setEvents(snapshot.events.slice(0, 40));
  };
  const applyComparisonResults = (rows: ComparisonResult[]) => setComparisonResults(rows);
  const applyDeadlockReport = (report: DeadlockReport) => setDeadlockReport(report);
  const applyExperimentResults = (rows: ExperimentResult[]) => setExperimentResults(rows);
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "Light");
  }, [theme]);
  useEffect(() => {
    if (simulation !== "Running" || dataSource === "live") return;
    const timer = setInterval(() => {
      tickRef.current += 1;
      const step = tickRef.current;
      setTick(step);
      setAgents((current) => simulationStep(current, step, algorithm));
      setEvents((current) =>
        [
          {
            time: new Date().toLocaleTimeString("en-GB"),
            agent: "SYS",
            text: `${algorithm} simulation · execution step ${step}`,
            type: "Running",
          },
          ...current,
        ].slice(0, 40),
      );
    }, 1400 / config.speed);
    return () => clearInterval(timer);
  }, [simulation, algorithm, config.speed, dataSource]);
  useEffect(() => {
    if (liveSnapshot) return;
    if (
      simulation === "Running" &&
      (agents.every((a) => a.status === "Completed" || a.status === "Failed") || tick * 2 >= limit)
    )
      setSimulation("Completed");
  }, [agents, tick, limit, simulation, liveSnapshot]);
  useEffect(() => {
    if (!monitoring && simulation !== "Running") return;
    const timer = setInterval(
      () =>
        setResourceHistory((current) => [
          ...current.slice(-23),
          {
            time: new Date().toLocaleTimeString("en-GB"),
            cpu: resources.cpuPercent,
            ram: resources.ramPercent,
          },
        ]),
      1600 / config.speed,
    );
    return () => clearInterval(timer);
  }, [monitoring, simulation, resources.cpuPercent, resources.ramPercent, config.speed]);
  const generate = (next: Configuration) => {
    setConfig(next);
    setAgents(generateAgents(next));
    setSimulation("Idle");
    setTick(0);
    tickRef.current = 0;
    setWorkloadVersion((v) => v + 1);
    setResourceHistory([]);
    setEvents([
      {
        time: new Date().toLocaleTimeString("en-GB"),
        agent: "SYS",
        text: `${next.count} agents generated · ${next.mode.toLowerCase()} workload`,
        type: "Pending",
      },
    ]);
  };
  const run = () => {
    setAgents((current) =>
      current.map((a, i) => ({
        ...a,
        status: i === 0 ? "Running" : "Pending",
        duration: 0,
        history: [
          "Simulation initialized",
          ...(i === 0 ? ["Resources allocated (simulated)"] : []),
        ],
      })),
    );
    setTick(0);
    tickRef.current = 0;
    setSimulation("Running");
    setEvents([
      {
        time: new Date().toLocaleTimeString("en-GB"),
        agent: "SYS",
        text: `${algorithm} simulation started · mock execution only`,
        type: "Running",
      },
    ]);
  };
  const reset = () => {
    setAgents(generateAgents(config, true));
    setSimulation("Idle");
    setTick(0);
    tickRef.current = 0;
    setEvents(initialEvents);
    setResourceHistory([]);
  };
  const resetAll = () => {
    setConfig({ ...defaults });
    setAgents(generateAgents(defaults, true));
    setSimulation("Idle");
    setTick(0);
    tickRef.current = 0;
    setEvents(initialEvents);
    setMonitoring(false);
    setResourceHistory([]);
    setAlgorithm("Priority");
    setLimit(60);
    setWorkloadVersion(1);
  };
  return {
    config,
    setConfig,
    agents,
    setAgents,
    algorithm,
    setAlgorithm,
    simulation,
    setSimulation,
    tick,
    limit,
    setLimit,
    events,
    resources,
    monitoring,
    setMonitoring,
    resourceHistory,
    theme,
    setTheme,
    workloadVersion,
    generate,
    run,
    reset,
    resetAll,
    elapsed,
    dataSource,
    liveSnapshot,
    comparisonResults,
    deadlockReport,
    experimentResults,
    applySimulationSnapshot,
    applyComparisonResults,
    applyDeadlockReport,
    applyExperimentResults,
  };
}
type DemoState = ReturnType<typeof useDemoState>;
const ResourceContext = createContext<DemoState | null>(null);
export function ResourceProvider({ children }: { children: ReactNode }) {
  const state = useDemoState();
  return <ResourceContext.Provider value={state}>{children}</ResourceContext.Provider>;
}
export function useResources() {
  const state = useContext(ResourceContext);
  if (!state) throw new Error("ResourceProvider is required");
  return state;
}
