import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Download,
  FileChartColumn,
  CheckCircle2,
  Filter,
  RotateCcw,
  Cpu,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PageHeading,
  Panel,
  Field,
  Stat,
  StatusBadge,
  MetricBarChart,
} from "@/components/dashboard-ui";
import { algorithms, reports, toCSV } from "@/lib/demo";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/reports")({
  head: () =>
    pageMeta(
      "Reports & Analytics",
      "Filter mock experiment history and export displayed AI agent resource reports as CSV.",
    ),
  component: Reports,
});
function Reports() {
  const [algorithm, setAlgorithm] = useState("All");
  const [workload, setWorkload] = useState("All");
  const [status, setStatus] = useState("All");
  const [from, setFrom] = useState("2026-11-01");
  const [to, setTo] = useState("2026-11-25");
  const [view, setView] = useState("Experiments");
  const filtered = reports.filter(
    (row) =>
      (algorithm === "All" || row.algorithm === algorithm) &&
      (workload === "All" || row.workload === workload) &&
      (status === "All" || row.status === status) &&
      (!from || row.date >= from) &&
      (!to || row.date <= to),
  );
  const displayed: Record<string, string | number>[] = filtered.map((row) =>
    view === "Resource utilization"
      ? {
          experiment: row.id,
          date: row.date,
          algorithm: row.algorithm,
          cpu: row.cpu,
          ram: row.ram,
          tokens: row.tokens,
        }
      : view === "Agent execution"
        ? {
            experiment: row.id,
            date: row.date,
            workload: row.workload,
            agents: row.agents,
            completion: row.completion,
            status: row.status,
          }
        : view === "Algorithm reports"
          ? {
              experiment: row.id,
              date: row.date,
              algorithm: row.algorithm,
              completion: row.completion,
              cpu: row.cpu,
              ram: row.ram,
              tokens: row.tokens,
            }
          : { ...row },
  );
  const exportCSV = () => {
    const url = URL.createObjectURL(
      new Blob([toCSV(displayed)], { type: "text/csv;charset=utf-8;" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `agent-${view.toLowerCase().replaceAll(" ", "-")}-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <>
      <PageHeading
        title="Reports & Analytics"
        description="Review historical mock experiments and export focused resource reports."
      >
        <Button variant="outline" disabled={!filtered.length} onClick={exportCSV}>
          <Download />
          Download CSV
        </Button>
      </PageHeading>
      <div className="mb-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat
          label="Experiments"
          value={filtered.length}
          icon={<FileChartColumn />}
          foot="matching selected filters"
        />
        <Stat
          label="Completed experiments"
          value={filtered.filter((r) => r.status === "Completed").length}
          icon={<CheckCircle2 />}
          color="text-success"
          foot="mock experiment history"
        />
        <Stat
          label="Average CPU"
          value={`${filtered.length ? (filtered.reduce((n, r) => n + r.cpu, 0) / filtered.length).toFixed(1) : 0}%`}
          icon={<Cpu />}
          color="text-cyan"
          foot="across displayed experiments"
        />
        <Stat
          label="Total tokens"
          value={filtered.reduce((n, r) => n + r.tokens, 0).toLocaleString()}
          icon={<Coins />}
          color="text-violet"
          foot="historical mock consumption"
        />
      </div>
      <Panel
        title="Report filters"
        subtitle="All report tables, summaries, and exports follow these filters."
        action={<Filter size={15} className="text-muted-foreground" />}
      >
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
          <Field label="Start date">
            <input
              className="field-input"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </Field>
          <Field label="End date">
            <input
              className="field-input"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </Field>
          <Field label="Algorithm">
            <select
              className="field-input"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
            >
              <option value="All">All algorithms</option>
              {algorithms.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Field>
          <Field label="Workload">
            <select
              className="field-input"
              value={workload}
              onChange={(e) => setWorkload(e.target.value)}
            >
              <option value="All">All workloads</option>
              <option>Random</option>
              <option>Sample</option>
            </select>
          </Field>
          <Field label="Experiment status">
            <select
              className="field-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="All">All statuses</option>
              <option>Completed</option>
              <option>Interrupted</option>
            </select>
          </Field>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-4"
          onClick={() => {
            setAlgorithm("All");
            setWorkload("All");
            setStatus("All");
            setFrom("2026-11-01");
            setTo("2026-11-25");
          }}
        >
          <RotateCcw />
          Clear filters
        </Button>
      </Panel>
      <div className="mb-5 mt-6 flex flex-wrap gap-2 border-b pb-4">
        {["Experiments", "Algorithm reports", "Resource utilization", "Agent execution"].map(
          (tab) => (
            <Button
              key={tab}
              variant={view === tab ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView(tab)}
            >
              {tab}
            </Button>
          ),
        )}
      </div>
      <Panel
        title={view === "Experiments" ? "Experiment history" : `${view} report`}
        subtitle="Historical mock records · not measurements from the current session"
        action={
          <span className="font-mono text-[9px] text-muted-foreground">
            {filtered.length} RECORDS
          </span>
        }
        body={false}
      >
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {Object.keys(
                  displayed[0] ?? { experiment: "", date: "", algorithm: "", status: "" },
                ).map((key) => (
                  <th key={key} className="capitalize">
                    {key === "cpu"
                      ? "CPU (%)"
                      : key === "ram"
                        ? "RAM (%)"
                        : key === "completion"
                          ? "Completion (%)"
                          : key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((row, i) => (
                <tr key={i}>
                  {Object.entries(row).map(([key, value]) => (
                    <td
                      key={key}
                      className={
                        key === "id" || key === "experiment"
                          ? "font-mono text-primary"
                          : "text-muted-foreground"
                      }
                    >
                      {key === "status" ? (
                        <StatusBadge status={String(value)} />
                      ) : typeof value === "number" && key === "tokens" ? (
                        value.toLocaleString()
                      ) : (
                        value
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <p className="py-14 text-center text-xs text-muted-foreground">
              No reports match your filters.
            </p>
          )}
        </div>
        <div className="border-t px-5 py-3 text-[10px] text-muted-foreground">
          {filtered.length} displayed records · CSV exports this view only
        </div>
      </Panel>
      <div className="mt-5">
        <Panel
          title="Completion by algorithm"
          subtitle="Average completion rate in the filtered mock report set"
        >
          <MetricBarChart
            data={algorithms
              .filter((a) => filtered.some((row) => row.algorithm === a))
              .map((a) => {
                const rows = filtered.filter((row) => row.algorithm === a);
                return {
                  algorithm: a,
                  completion: Number(
                    (rows.reduce((n, row) => n + row.completion, 0) / rows.length).toFixed(1),
                  ),
                };
              })}
            metric="completion"
            label="Completion rate (%)"
          />
        </Panel>
      </div>
    </>
  );
}
