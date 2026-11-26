import { createFileRoute } from "@tanstack/react-router";
import { Activity, Pause, Play, Cpu, MemoryStick } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PageHeading,
  Panel,
  ResourceOverview,
  UtilizationChart,
  StatusBadge,
  MetricBarChart,
  DataSourceBadge,
} from "@/components/dashboard-ui";
import { useResources } from "@/components/resource-provider";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/resources")({
  head: () =>
    pageMeta(
      "Resource Monitor",
      "Inspect CPU, RAM, and token capacity, live simulated allocation, and resource history.",
    ),
  component: Resources,
});
function Resources() {
  const { monitoring, setMonitoring, agents, resources, dataSource } = useResources();
  const running = agents.filter((a) => a.status === "Running");
  return (
    <>
      <PageHeading
        title="Resource Monitor"
        description="Inspect system capacity, resource allocation, and simulated utilization."
      >
        <Button
          variant={monitoring ? "outline" : "default"}
          onClick={() => setMonitoring(!monitoring)}
        >
          {monitoring ? <Pause /> : <Play />}
          {monitoring ? "Pause monitoring" : "Start monitoring"}
        </Button>
      </PageHeading>
      <div className="mb-5 flex items-center gap-2 text-[10px] text-muted-foreground">
        <Activity size={12} className={monitoring ? "text-success" : "text-muted-foreground"} />
        {monitoring
          ? "Monitoring active · sampling shared resource state"
          : "Monitoring paused · showing last available measurements"}
        <span className="ml-auto">
          <DataSourceBadge source={dataSource} />
        </span>
      </div>
      <ResourceOverview large />
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel
          title="CPU utilization history"
          subtitle="Illustrative history until monitoring collects session measurements"
          action={<Cpu size={16} className="text-primary" />}
        >
          <UtilizationChart mode="cpu" />
        </Panel>
        <Panel
          title="RAM utilization history"
          subtitle="Shared simulated resource measurements"
          action={<MemoryStick size={16} className="text-cyan" />}
        >
          <UtilizationChart mode="ram" />
        </Panel>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Panel
          title="Allocation by agent"
          subtitle="Resources currently assigned to running agents"
          body={false}
        >
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>CPU</th>
                  <th>RAM</th>
                  <th>Token consumption</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {running.map((a) => (
                  <tr key={a.id}>
                    <td className="font-mono text-primary">{a.id}</td>
                    <td>{a.cpu} cores</td>
                    <td>{a.ram} GB</td>
                    <td>{Math.round(a.tokens * 0.35).toLocaleString()}</td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!running.length && (
              <div className="p-10 text-center text-xs text-muted-foreground">
                No running agents. Resources are available.
              </div>
            )}
          </div>
          <div className="flex justify-between border-t px-5 py-4 text-[10px] text-muted-foreground">
            <span>{running.length} running agents</span>
            <span>
              CPU {resources.cpu} cores · RAM {resources.ram} GB allocated
            </span>
          </div>
        </Panel>
        <Panel
          title="Token consumption by agent"
          subtitle="Consumed tokens · completed and running agents"
        >
          <MetricBarChart
            data={agents
              .filter((a) => ["Running", "Completed"].includes(a.status))
              .map((a) => ({
                algorithm: a.id,
                tokens: a.status === "Completed" ? a.tokens : Math.round(a.tokens * 0.35),
              }))}
            metric="tokens"
            label="Tokens consumed"
          />
        </Panel>
      </div>
    </>
  );
}
