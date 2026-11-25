import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  Bot,
  CircleCheck,
  Activity,
  Clock3,
  Play,
  ArrowUpRight,
  ChevronDown,
  Cpu,
  Check,
  AlertTriangle,
  ArrowRight,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PageHeading,
  Panel,
  Stat,
  ResourceOverview,
  UtilizationChart,
  StatusDonut,
  ActivityChart,
  StatusBadge,
} from "@/components/dashboard-ui";
import { useResources } from "@/components/resource-provider";
import { pageMeta } from "@/lib/page-meta";
import { toCSV } from "@/lib/demo";
import { useState } from "react";

// The home route ships no og:image, so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () =>
    pageMeta(
      "Overview",
      "Monitor simulated AI agent workloads, scheduling activity, and CPU, RAM, and token allocation.",
    ),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  const { agents, resources, events, simulation, run, tick, config } = useResources();
  const [period, setPeriod] = useState("Last 12 minutes");
  const count = (status: string) => agents.filter((a) => a.status === status).length;
  const download = () => {
    const csv = toCSV(
      agents.map((a) => ({
        agent: a.id,
        task: a.task,
        status: a.status,
        cpu: a.cpu,
        ram: a.ram,
        tokens: a.tokens,
      })),
    );
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "agent-overview.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <>
      <PageHeading
        title="Overview"
        description="A real-time view of your agents, resources, and scheduling activity."
      >
        <Button variant="outline" size="sm" onClick={download}>
          <Download />
          Export overview
        </Button>
        <Button size="sm" onClick={run} disabled={simulation === "Running"}>
          <Play />
          Run simulation
        </Button>
      </PageHeading>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-[10px]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 text-success">
            <span className="status-dot" />
            System healthy
          </span>
          <span className="text-border">|</span>
          <span className="text-muted-foreground">
            Active workload <span className="ml-1 font-mono text-foreground">WL-001</span>
          </span>
          <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
            SIMULATED
          </span>
        </div>
        <span className="text-muted-foreground">
          {simulation === "Running"
            ? `Simulation elapsed · ${tick * 2}s`
            : "Session overview · demo data"}
        </span>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat
          label="Total agents"
          value={agents.length}
          icon={<Bot />}
          foot="in the current workload"
        />
        <Stat
          label="Completed agents"
          value={count("Completed")}
          icon={<CircleCheck />}
          color="text-success"
          trend={`${Math.round((count("Completed") / agents.length) * 100)}%`}
          foot="completion rate"
        />
        <Stat
          label="Running agents"
          value={count("Running")}
          icon={<Activity />}
          color="text-cyan"
          foot="actively consuming resources"
        />
        <Stat
          label="Waiting agents"
          value={count("Pending")}
          icon={<Clock3 />}
          color="text-warning"
          foot="in the scheduling queue"
        />
      </div>
      <div className="mb-5 grid gap-5 xl:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
        <Panel
          title="Resource utilization"
          subtitle={
            period === "Last 12 minutes"
              ? "CPU and RAM usage over time · illustrative session history"
              : "Current workload snapshot · shared resource state"
          }
          action={
            <select
              aria-label="Chart time range"
              className="field-input h-7 w-32 text-[9px]"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option>Last 12 minutes</option>
              <option>Current snapshot</option>
            </select>
          }
        >
          <div className="mb-1 flex items-center gap-5">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="legend-dot text-primary" />
              CPU<span className="font-mono text-foreground">{resources.cpuPercent}%</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="legend-dot text-cyan" />
              RAM<span className="font-mono text-foreground">{resources.ramPercent}%</span>
            </div>
          </div>
          {period === "Last 12 minutes" ? (
            <UtilizationChart />
          ) : (
            <div className="flex h-[230px] items-center">
              <ResourceOverview />
            </div>
          )}
          <div className="mt-3 flex items-center gap-2 border-t pt-3 font-mono text-[9px] text-muted-foreground">
            <span className="status-dot text-success" />
            {simulation === "Running" ? "Updating simulated measurements" : "Historical mock data"}
            <span className="ml-auto">
              {config.cpu} CPU cores · {config.ram} GB RAM
            </span>
          </div>
        </Panel>
        <Panel
          title="Resource allocation"
          subtitle="Current capacity and availability"
          action={<Cpu size={16} className="text-muted-foreground" />}
        >
          <ResourceOverview />
        </Panel>
      </div>
      <div className="mb-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.85fr)]">
        <Panel
          title="Agent status distribution"
          subtitle="Current workload lifecycle"
          action={
            <span className="rounded bg-muted px-2 py-1 font-mono text-[9px] text-muted-foreground">
              {agents.length} AGENTS
            </span>
          }
        >
          <StatusDonut />
        </Panel>
        <Panel
          title="Recent activity"
          subtitle="Latest events across your simulation"
          action={
            <Button variant="ghost" size="sm" asChild className="h-6 text-[10px] text-primary">
              <Link to="/scheduler">
                View all
                <ArrowUpRight />
              </Link>
            </Button>
          }
        >
          <div>
            {events.slice(0, 5).map((event, i) => (
              <div className="event-row" key={`${event.time}-${i}`}>
                <span className={`event-icon status-${event.type}`}>
                  {event.type === "Completed" ? (
                    <Check />
                  ) : event.type === "Failed" ? (
                    <AlertTriangle />
                  ) : event.type === "Pending" ? (
                    <Clock3 />
                  ) : (
                    <Activity />
                  )}
                </span>
                <div className="event-text">
                  <span className="mr-2 font-mono text-foreground">{event.agent}</span>
                  <span className="text-muted-foreground">{event.text}</span>
                </div>
                <span className="event-time">{event.time}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="status-dot text-success" />
            Event stream connected to demo state
          </div>
        </Panel>
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
        <Panel
          title="Agent execution activity"
          subtitle="Illustrative completed and failed executions over time"
          action={
            <div className="flex gap-3 text-[9px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="legend-dot text-primary" />
                Completed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="legend-dot text-destructive" />
                Failed
              </span>
            </div>
          }
        >
          <ActivityChart />
        </Panel>
        <Panel title="Scheduling snapshot" subtitle="Current execution environment">
          <div className="space-y-4 text-[11px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Simulation status</span>
              <StatusBadge status={simulation} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Failed agents</span>
              <span className="font-mono text-destructive">{count("Failed")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tokens consumed</span>
              <span className="font-mono">{resources.tokens.toLocaleString()}</span>
            </div>
            <div className="border-t pt-4">
              <Button variant="outline" className="w-full justify-between text-[11px]" asChild>
                <Link to="/scheduler">
                  Open scheduler
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}
