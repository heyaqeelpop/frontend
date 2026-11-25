import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Cpu,
  MemoryStick,
  Coins,
  Timer,
  Workflow,
  CheckCircle2,
  BrainCircuit,
  RotateCw,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  PageHeading,
  Panel,
  Field,
  Stat,
  StatusBadge,
  AgentTable,
} from "@/components/dashboard-ui";
import { useResources } from "@/components/resource-provider";
import { algorithms, algorithmDescriptions } from "@/lib/demo";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/scheduler")({
  head: () =>
    pageMeta(
      "Scheduler",
      "Run, pause, and inspect frontend simulations of priority, round robin, fixed quota, and PPO scheduling.",
    ),
  component: Scheduler,
});
function Scheduler() {
  const {
    agents,
    algorithm,
    setAlgorithm,
    simulation,
    setSimulation,
    run,
    reset,
    resources,
    limit,
    setLimit,
    tick,
    events,
    workloadVersion,
    config,
    generate,
  } = useResources();
  const [showEvents, setShowEvents] = useState(true);
  const [workload, setWorkload] = useState("current");
  const done = agents.filter((a) => a.status === "Completed" || a.status === "Failed").length;
  const progress = simulation === "Idle" ? 0 : Math.round((done / agents.length) * 100);
  const start = () => {
    if (workload === "sample") generate({ ...config, mode: "Sample", count: 5, min: 1 });
    run();
    toast.success("Frontend simulation started. No backend or model inference.");
  };
  return (
    <>
      <PageHeading
        title="Scheduler"
        description="Allocate resources and orchestrate agent execution with simulated scheduling."
      >
        <StatusBadge status={simulation} />
      </PageHeading>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {algorithms.map((a, i) => (
          <Button
            key={a}
            variant="outline"
            disabled={simulation === "Running" || simulation === "Paused"}
            className={`algorithm-option ${algorithm === a ? "selected" : ""}`}
            onClick={() => setAlgorithm(a)}
          >
            <div className="flex w-full items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-semibold">
                {i === 3 ? (
                  <BrainCircuit className="text-violet" />
                ) : (
                  <Workflow className="text-primary" />
                )}
                {a === "PPO v2" ? "PPO AI Scheduler" : a === "Priority" ? "Priority Scheduling" : a}
              </span>
              {algorithm === a && <CheckCircle2 className="text-primary" size={14} />}
            </div>
            <span className="mt-3 text-[10px] leading-5 text-muted-foreground">
              {algorithmDescriptions[a]}
            </span>
          </Button>
        ))}
      </div>
      <Panel
        title="Simulation configuration"
        subtitle="All execution and policy choices below are predefined frontend behavior."
        action={<SlidersHorizontal size={16} className="text-muted-foreground" />}
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Workload">
            <select
              className="field-input"
              value={workload}
              disabled={simulation === "Running" || simulation === "Paused"}
              onChange={(e) => setWorkload(e.target.value)}
            >
              <option value="current">
                Current · WL-{String(workloadVersion).padStart(3, "0")} · {agents.length} agents
              </option>
              <option value="sample">Sample workload · 5 agents</option>
            </select>
          </Field>
          <Field label="Simulation time limit (seconds)">
            <input
              className="field-input"
              type="number"
              min={2}
              max={300}
              value={limit}
              disabled={simulation === "Running"}
              onChange={(e) => setLimit(Math.max(2, Math.min(300, Number(e.target.value))))}
            />
          </Field>
          <Field label="Execution event stream">
            <div className="flex h-9 items-center gap-3">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={showEvents}
                onChange={(e) => setShowEvents(e.target.checked)}
              />
              <span className="text-xs">Display execution events</span>
            </div>
          </Field>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t pt-5">
          <Button onClick={start} disabled={simulation === "Running" || simulation === "Paused"}>
            <Play />
            Run simulation
          </Button>
          <Button
            variant="outline"
            disabled={simulation !== "Running"}
            onClick={() => setSimulation("Paused")}
          >
            <Pause />
            Pause
          </Button>
          <Button
            variant="outline"
            disabled={simulation !== "Paused"}
            onClick={() => setSimulation("Running")}
          >
            <RotateCw />
            Resume
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              reset();
              toast.info("Simulation reset to initial demo state");
            }}
          >
            <RotateCcw />
            Reset
          </Button>
          <span className="ml-auto font-mono text-[10px] text-muted-foreground">
            Algorithm: <span className="text-primary">{algorithm}</span>
          </span>
        </div>
      </Panel>
      <div className="mb-5 mt-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat
          label="CPU utilization"
          value={`${resources.cpuPercent}%`}
          icon={<Cpu />}
          foot={`${resources.cpu} cores allocated`}
        />
        <Stat
          label="RAM utilization"
          value={`${resources.ramPercent}%`}
          icon={<MemoryStick />}
          color="text-cyan"
          foot={`${resources.ram} GB allocated`}
        />
        <Stat
          label="Token consumption"
          value={resources.tokens.toLocaleString()}
          icon={<Coins />}
          color="text-violet"
          foot="simulated consumption"
        />
        <Stat
          label="Elapsed time"
          value={`${tick * 2}s`}
          icon={<Timer />}
          color="text-warning"
          foot={`${limit}s time limit`}
        />
      </div>
      <Panel
        title="Execution progress"
        subtitle={`${done} of ${agents.length} agents finished · ${agents.filter((a) => a.status === "Failed").length} failed`}
        action={<span className="font-mono text-sm text-primary">{progress}%</span>}
      >
        <progress className="resource-progress" value={progress} max={100} />
        {simulation === "Completed" && (
          <p className="mt-4 text-xs text-success">
            Simulation finished.{" "}
            {tick * 2 >= limit && progress < 100
              ? "Time limit reached with unfinished agents."
              : "All agents reached a final state."}{" "}
            Results are simulated.
          </p>
        )}
      </Panel>
      {showEvents && (
        <div className="mt-5">
          <Panel
            title="Execution event log"
            subtitle="Mock scheduler events · newest first"
            action={
              <span className="font-mono text-[9px] text-muted-foreground">
                {events.length} EVENTS
              </span>
            }
          >
            <div className="max-h-60 overflow-y-auto font-mono">
              {events.map((event, i) => (
                <div key={i} className="flex gap-3 border-b py-2.5 text-[10px] last:border-0">
                  <span className="text-muted-foreground">{event.time}</span>
                  <span className="text-primary">[{event.agent}]</span>
                  <span className="text-muted-foreground">{event.text}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}
      <div className="mt-5">
        <Panel
          title="Workload execution state"
          subtitle="Shared across Overview, Agent Monitor, and Resource Monitor"
          body={false}
        >
          <AgentTable />
        </Panel>
      </div>
    </>
  );
}
