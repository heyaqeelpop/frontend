import { createFileRoute } from "@tanstack/react-router";
import { Bot, Activity, CircleCheck, AlertTriangle } from "lucide-react";
import { PageHeading, Panel, AgentTable, Stat } from "@/components/dashboard-ui";
import { useResources } from "@/components/resource-provider";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/agents")({
  head: () =>
    pageMeta(
      "Agent Monitor",
      "Inspect simulated AI agent lifecycle, execution history, and allocated resources.",
    ),
  component: Agents,
});
function Agents() {
  const { agents } = useResources();
  return (
    <>
      <PageHeading
        title="Agent Monitor"
        description="Track every agent from the waiting queue to execution and completion."
      >
        <span className="status-badge text-cyan">Shared workload</span>
      </PageHeading>
      <div className="mb-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat
          label="Total agents"
          value={agents.length}
          icon={<Bot />}
          foot="in the active workload"
        />
        <Stat
          label="Running"
          value={agents.filter((a) => a.status === "Running").length}
          icon={<Activity />}
          color="text-cyan"
          foot="resources allocated"
        />
        <Stat
          label="Completed"
          value={agents.filter((a) => a.status === "Completed").length}
          icon={<CircleCheck />}
          color="text-success"
          foot="execution finished"
        />
        <Stat
          label="Failed"
          value={agents.filter((a) => a.status === "Failed").length}
          icon={<AlertTriangle />}
          color="text-destructive"
          foot="deadline or execution failure"
        />
      </div>
      <Panel
        title="Agent directory"
        subtitle="Resource requirements and lifecycle status"
        body={false}
      >
        <AgentTable detailed />
      </Panel>
    </>
  );
}
