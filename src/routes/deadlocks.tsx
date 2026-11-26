import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Network,
  Play,
  RotateCcw,
  ShieldCheck,
  Unlock,
  Cpu,
  Coins,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeading, Panel, Stat, DataSourceBadge } from "@/components/dashboard-ui";
import { useResources } from "@/components/resource-provider";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/deadlocks")({
  head: () =>
    pageMeta(
      "Deadlock Monitor",
      "Explore a simulated circular resource wait, deadlock victim selection, and resource recovery.",
    ),
  component: Deadlocks,
});
type Phase = "safe" | "detected" | "recovered";
function Deadlocks() {
  const [phase, setPhase] = useState<Phase>("safe");
  // Report from the Python deadlock detector; empty until the backend is connected.
  const { deadlockReport } = useResources();
  const [events, setEvents] = useState(["Monitor initialized · no circular wait detected"]);
  const recover = () => {
    setPhase("recovered");
    setEvents((current) => [
      "Recovery completed · circular wait resolved",
      "A002 finished and released 4 GB RAM · A001 can proceed",
      "A003 selected as victim (lowest priority P1) · 1,200 tokens released",
      ...current,
    ]);
  };
  useEffect(() => {
    if (phase !== "detected") return;
    const timer = setTimeout(recover, 7000);
    return () => clearTimeout(timer);
  }, [phase]);
  const demo = () => {
    setPhase("detected");
    setEvents([
      "Deadlock detected · A001 → A002 → A003 → A001",
      "A003 holds tokens, waiting for CPU held by A001",
      "A002 holds RAM, waiting for tokens held by A003",
      "A001 holds CPU, waiting for RAM held by A002",
      "Simulated circular-wait scenario started",
    ]);
  };
  return (
    <>
      <PageHeading
        title="Deadlock Monitor"
        description="Detect circular resource waits and inspect simulated recovery behavior."
      >
        <Button
          variant="outline"
          onClick={() => {
            setPhase("safe");
            setEvents(["Monitor reset · no circular wait detected"]);
          }}
        >
          <RotateCcw />
          Reset demo
        </Button>
        <Button onClick={demo} disabled={phase === "detected"}>
          <Play />
          Run deadlock demo
        </Button>
      </PageHeading>
      <div
        className={`mb-5 flex items-center gap-3 rounded-md border p-4 ${phase === "detected" ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-success/20 bg-success/5 text-success"}`}
      >
        {phase === "detected" ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />}
        <div>
          <h2 className="text-xs font-semibold">
            {phase === "detected"
              ? "Deadlock detected · circular resource wait"
              : phase === "recovered"
                ? "Recovery complete · no deadlock detected"
                : "No deadlock detected"}
          </h2>
          <p className="mt-1 text-[10px]">
            {phase === "detected"
              ? "Recovery victim selected: A003. Automatic recovery follows in 7 seconds."
              : "Simulated demonstration · separate from the active workload."}
          </p>
        </div>
        <span className="ml-auto hidden rounded border border-current/20 px-2 py-1 font-mono text-[9px] sm:block">
          DEMO · not connected to Python detector
        </span>
      </div>
      <div className="mb-5">
        <Panel
          title="Deadlock detector report"
          subtitle="Results from the Python deadlock detector"
          action={<DataSourceBadge source={deadlockReport ? "live" : "demo"} />}
        >
          {deadlockReport ? (
            <dl className="grid gap-4 text-xs sm:grid-cols-2 xl:grid-cols-5">
              {[
                [
                  "Detected cycles",
                  deadlockReport.cycles.length
                    ? deadlockReport.cycles.map((c) => c.join(" → ")).join(" · ")
                    : "None",
                ],
                ["Involved agents", deadlockReport.agents.join(", ") || "—"],
                ["Victim agent", deadlockReport.victim ?? "—"],
                ["Recovery action", deadlockReport.action],
                [
                  "Released resources",
                  `${deadlockReport.released.cpu} CPU · ${deadlockReport.released.ram} GB RAM`,
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="mt-1 font-mono text-[11px]">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-[11px] leading-5 text-muted-foreground">
              No detector report yet. Detected cycles, involved agents, the selected victim,
              recovery action, and released CPU and RAM will appear here once the Python backend is
              connected. The graph below is a DEMO scenario.
            </p>
          )}
        </Panel>
      </div>
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Stat
          label="Circular waits"
          value={phase === "detected" ? 1 : 0}
          icon={<Network />}
          color={phase === "detected" ? "text-destructive" : "text-success"}
          foot="in the demonstration graph"
        />
        <Stat
          label="Agents in cycle"
          value={phase === "detected" ? 3 : 0}
          icon={<AlertTriangle />}
          color="text-warning"
          foot="A001 · A002 · A003"
        />
        <Stat
          label="Resources recovered"
          value={phase === "recovered" ? "1,200" : "0"}
          icon={<Unlock />}
          color="text-cyan"
          foot="tokens released by recovery victim"
        />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Panel
          title="Wait-for graph · DEMO"
          subtitle="Directed edges point to the agent holding the requested resource"
          action={
            <span
              className={`status-badge ${phase === "detected" ? "text-destructive" : "text-success"}`}
            >
              {phase === "detected" ? "Cycle detected" : "No cycle"}
            </span>
          }
        >
          <svg
            className={`wait-graph ${phase === "detected" ? "detected" : ""}`}
            viewBox="0 0 520 300"
            role="img"
            aria-label={
              phase === "detected"
                ? "Circular resource wait: A001 waits for A002, A002 waits for A003, A003 waits for A001"
                : "No circular wait in agent dependencies"
            }
          >
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path
                  d="M 0 0 L 8 4 L 0 8 Z"
                  fill={phase === "detected" ? "var(--destructive)" : "var(--muted-foreground)"}
                />
              </marker>
            </defs>
            <path className="edge" d="M 144 125 L 241 70" markerEnd="url(#arrow)" />
            <text className="edge-label" x="150" y="72">
              waits for RAM
            </text>
            {phase !== "recovered" && (
              <>
                <path className="edge" d="M 296 72 L 384 126" markerEnd="url(#arrow)" />
                <text className="edge-label" x="320" y="74">
                  waits for tokens
                </text>
              </>
            )}
            {phase === "detected" && (
              <>
                <path className="edge" d="M 382 164 Q 260 284 142 164" markerEnd="url(#arrow)" />
                <text className="edge-label" x="212" y="252">
                  waits for CPU
                </text>
              </>
            )}
            <circle className="node" cx="110" cy="145" r="35" />
            <text x="90" y="149">
              A001
            </text>
            <text className="edge-label" x="73" y="202">
              Holds CPU · P5
            </text>
            <circle className="node" cx="270" cy="52" r="35" />
            <text x="250" y="56">
              A002
            </text>
            <text className="edge-label" x="226" y="111">
              Holds RAM · P3
            </text>
            <circle
              className="node"
              cx="412"
              cy="145"
              r="35"
              opacity={phase === "recovered" ? 0.35 : 1}
            />
            <text x="392" y="149">
              A003
            </text>
            <text className="edge-label" x="365" y="203">
              {phase === "recovered" ? "Victim released" : "Holds tokens · P1"}
            </text>
          </svg>
          <div className="flex flex-wrap items-center gap-3 border-t pt-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="legend-dot text-primary" />
              Agent
            </span>
            <span className="flex items-center gap-2">
              <ArrowRight size={13} />
              Resource dependency
            </span>
            {phase === "detected" && (
              <span className="text-destructive">Highlighted circular wait</span>
            )}
          </div>
        </Panel>
        <Panel title="Recovery details · DEMO" subtitle="Lowest-priority victim selection strategy">
          <div className="space-y-5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recovery victim</span>
              <span className="font-mono text-destructive">{phase === "safe" ? "—" : "A003"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Victim priority</span>
              <span className="font-mono">{phase === "safe" ? "—" : "P1 · lowest"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Selection reason</span>
              <span>Minimum priority</span>
            </div>
            <div className="border-t pt-5">
              <h3 className="mb-4 font-semibold">Resource release</h3>
              <div className="mb-3 flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Coins size={14} />
                  Tokens (A003)
                </span>
                <span className={phase === "recovered" ? "text-success" : ""}>
                  {phase === "recovered" ? "1,200 released" : "Held"}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Cpu size={14} />
                  RAM (A002)
                </span>
                <span className={phase === "recovered" ? "text-success" : ""}>
                  {phase === "recovered" ? "4 GB released" : "Held"}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              disabled={phase !== "detected"}
              className="w-full"
              onClick={recover}
            >
              <Unlock />
              Recover resources now
            </Button>
            <p className="text-[10px] leading-5 text-muted-foreground">
              Victim termination frees tokens, allowing A002 to finish and release RAM. A001 can
              then continue. This breaks the circular wait.
            </p>
          </div>
        </Panel>
      </div>
      <div className="mt-5">
        <Panel
          title="Deadlock event history · DEMO"
          subtitle="Simulated dependencies, detection, and recovery events"
        >
          <div className="font-mono">
            {events.map((event, i) => (
              <div key={i} className="flex gap-4 border-b py-3 text-[10px] last:border-0">
                <span className="text-muted-foreground">
                  {String(events.length - i).padStart(2, "0")}
                </span>
                <span
                  className={
                    event.startsWith("Deadlock detected")
                      ? "text-destructive"
                      : event.includes("Recovery completed")
                        ? "text-success"
                        : "text-muted-foreground"
                  }
                >
                  {event}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
