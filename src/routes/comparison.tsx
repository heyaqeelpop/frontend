import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Check, Trophy, Info, ChartNoAxesCombined, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  PageHeading,
  Panel,
  MetricBarChart,
  Stat,
  DataSourceBadge,
} from "@/components/dashboard-ui";
import { useResources } from "@/components/resource-provider";
import { algorithms, comparison, type Algorithm } from "@/lib/demo";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/comparison")({
  head: () =>
    pageMeta(
      "Algorithm Comparison",
      "Compare provided historical experimental averages for four AI agent scheduling approaches.",
    ),
  component: Comparison,
});
const metrics = [
  { key: "completed", label: "Completed agents", unit: "", high: true },
  { key: "failed", label: "Failed agents", unit: "", high: false },
  { key: "completion", label: "Completion rate", unit: "%", high: true },
  { key: "makespan", label: "Makespan", unit: "s", high: false },
  { key: "cpu", label: "Average CPU", unit: "%", high: true },
  { key: "ram", label: "Average RAM", unit: "%", high: true },
  { key: "tokens", label: "Tokens consumed", unit: "", high: false },
] as const;
function Comparison() {
  const [selected, setSelected] = useState<Algorithm[]>([...algorithms]);
  const [applied, setApplied] = useState<Algorithm[]>([...algorithms]);
  const [ran, setRan] = useState(false);
  const { comparisonResults } = useResources();
  // Live backend results replace the historical dataset once they arrive.
  const source = comparisonResults ? "live" : "historical";
  const rows = comparisonResults ?? comparison;
  const filtered = rows.filter((row) => applied.some((a) => a === row.algorithm));
  const data = filtered.length ? filtered : rows;
  const toggle = (algorithm: Algorithm) =>
    setSelected((current) =>
      current.includes(algorithm)
        ? current.filter((a) => a !== algorithm)
        : [...current, algorithm],
    );
  const run = () => {
    if (!comparisonResults) {
      setApplied([...selected]);
      setRan(true);
      toast.success("Historical comparison updated. No live experiment was executed.");
      return;
    }
    setApplied([...selected]);
    setRan(true);
    toast.success("Comparison updated from backend results.");
  };
  return (
    <>
      <PageHeading
        title="Algorithm Comparison"
        description="Compare scheduling approaches using historical experimental averages."
      >
        <Button onClick={run} disabled={selected.length < 2}>
          <Play />
          Run comparison
        </Button>
        <DataSourceBadge source={source} />
      </PageHeading>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b pb-5">
        <div className="flex flex-wrap gap-2">
          {algorithms.map((algorithm) => (
            <Button
              key={algorithm}
              variant={selected.includes(algorithm) ? "secondary" : "outline"}
              size="sm"
              onClick={() => toggle(algorithm)}
            >
              {selected.includes(algorithm) && <Check size={12} />}
              {algorithm}
            </Button>
          ))}
        </div>
        <span className="font-mono text-[9px] text-muted-foreground">
          {selected.length} ALGORITHMS SELECTED
        </span>
      </div>
      <div className="mb-5 flex items-start gap-3 rounded-md border border-primary/20 bg-primary/5 p-4">
        <Info size={16} className="shrink-0 text-primary" />
        <div>
          <p className="text-xs font-semibold">
            {source === "live"
              ? "Live backend results"
              : "Historical experimental averages · not live measurements"}
          </p>
          <p className="mt-1 text-[11px] leading-6 text-muted-foreground">
            {ran
              ? "Selected algorithm results are displayed below."
              : "Previewing the provided historical dataset. Run comparison to apply your selection."}{" "}
            These are aggregate averages, not a new simulation or real PPO inference.
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[10px] text-muted-foreground">
            <li>
              <span className="text-primary">HISTORICAL</span> · recorded experiment averages (PPO
              v2 row is a historical version)
            </li>
            <li>
              <span className="text-warning">DEMO</span> · illustrative values elsewhere in the
              dashboard
            </li>
            <li>
              <span className="text-success">LIVE BACKEND</span> · results from the Python backend ·{" "}
              {comparisonResults ? "received" : "not connected yet"}
            </li>
          </ul>
        </div>
      </div>
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Stat
          label="Highest completion rate"
          value={`${Math.max(...data.map((a) => a.completion))}%`}
          icon={<Trophy />}
          color="text-success"
          foot={data.reduce((a, b) => (a.completion > b.completion ? a : b)).algorithm}
        />
        <Stat
          label="Shortest makespan"
          value={`${Math.min(...data.map((a) => a.makespan))}s`}
          icon={<ChartNoAxesCombined />}
          foot={data.reduce((a, b) => (a.makespan < b.makespan ? a : b)).algorithm}
        />
        <Stat
          label="Lowest token usage"
          value={Math.min(...data.map((a) => a.tokens)).toLocaleString()}
          icon={<ArrowUpRight />}
          color="text-violet"
          foot={data.reduce((a, b) => (a.tokens < b.tokens ? a : b)).algorithm}
        />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {[
          {
            metric: "completion",
            title: "Completion rate",
            subtitle: "Percentage of agents successfully completed",
          },
          {
            metric: "makespan",
            title: "Execution makespan",
            subtitle: "Total execution time in seconds · lower is better",
          },
          {
            metric: "cpu",
            title: "Average CPU utilization",
            subtitle: "Historical average allocation (%)",
          },
          {
            metric: "ram",
            title: "Average RAM utilization",
            subtitle: "Historical average allocation (%)",
          },
        ].map((item) => (
          <Panel key={item.metric} title={item.title} subtitle={item.subtitle}>
            <MetricBarChart data={data} metric={item.metric} label={item.title} />
          </Panel>
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.5fr]">
        <Panel
          title="Token consumption"
          subtitle="Total tokens consumed · lower resource footprint"
        >
          <MetricBarChart data={data} metric="tokens" label="Tokens consumed" />
        </Panel>
        <Panel title="Key insights" subtitle="Every metric has its own trade-offs">
          <div className="space-y-5 text-xs leading-6 text-muted-foreground">
            <p>
              <span className="font-semibold text-success">Fixed Quota leads in completion.</span>{" "}
              Its 47.9% completion rate and 5.6 completed agents are the highest historical
              averages.
            </p>
            <p>
              <span className="font-semibold text-primary">Priority has the shortest makespan</span>{" "}
              at 46.7s, while completing more agents than PPO v2.
            </p>
            <p>
              <span className="font-semibold text-violet">PPO v2 consumes fewer tokens</span>{" "}
              (5,876), but its 27.5% completion rate is lowest. Less consumption alone does not
              imply a better scheduler.
            </p>
          </div>
        </Panel>
      </div>
      <div className="mt-5">
        <Panel
          title="Detailed algorithm comparison"
          subtitle="Best result highlighted for each metric among the displayed algorithms"
          body={false}
        >
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  {data.map((row) => (
                    <th key={row.algorithm}>{row.algorithm}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric) => {
                  const values = data.map((row) => row[metric.key]);
                  const best = metric.high ? Math.max(...values) : Math.min(...values);
                  return (
                    <tr key={metric.key}>
                      <td className="text-muted-foreground">{metric.label}</td>
                      {data.map((row) => (
                        <td key={row.algorithm}>
                          <span
                            className={`inline-flex items-center gap-2 font-mono ${row[metric.key] === best ? "text-success" : ""}`}
                          >
                            {metric.key === "tokens"
                              ? row[metric.key].toLocaleString()
                              : row[metric.key]}
                            {metric.unit}
                            {row[metric.key] === best && <Trophy size={11} />}
                          </span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="border-t px-5 py-4 text-[10px] leading-5 text-muted-foreground">
            Completed agents, completion rate, CPU and RAM: higher highlighted. Failed agents,
            makespan and tokens: lower highlighted. Higher utilization indicates more allocation,
            not necessarily better efficiency. There is no overall winner.
          </p>
        </Panel>
      </div>
    </>
  );
}
