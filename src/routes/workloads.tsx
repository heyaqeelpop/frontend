import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Layers,
  Cpu,
  MemoryStick,
  Coins,
  RotateCcw,
  RefreshCw,
  Plus,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeading, Panel, Stat, Field, AgentTable } from "@/components/dashboard-ui";
import { useResources } from "@/components/resource-provider";
import { defaults, type Configuration } from "@/lib/demo";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/workloads")({
  head: () =>
    pageMeta(
      "Workload Manager",
      "Configure and generate reproducible mock agent workloads with CPU, RAM, and token requirements.",
    ),
  component: Workloads,
});
function Workloads() {
  const { config, agents, generate, workloadVersion } = useResources();
  const [draft, setDraft] = useState<Configuration>({ ...config });
  const [error, setError] = useState("");
  const update = (key: keyof Configuration, value: number) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const submit = (regenerate = false) => {
    if (
      draft.count < 1 ||
      draft.count > 20 ||
      draft.min < 1 ||
      draft.max > 20 ||
      draft.min > draft.max ||
      draft.count < draft.min ||
      draft.count > draft.max ||
      draft.cpu < 1 ||
      draft.ram < 1 ||
      draft.tokens < 1 ||
      !Number.isInteger(draft.count)
    ) {
      setError(
        "Choose 1–20 agents within the minimum and maximum range, and positive resource capacities.",
      );
      return;
    }
    const next = { ...draft, seed: regenerate ? draft.seed + 1 : draft.seed };
    setDraft(next);
    setError("");
    generate(next);
    toast.success(`Workload generated · ${next.count} agents ready`);
  };
  const fields: {
    key: "count" | "min" | "max" | "seed" | "cpu" | "ram" | "tokens";
    label: string;
    min: number;
    max?: number;
  }[] = [
    { key: "count", label: "Number of agents", min: 1, max: 20 },
    { key: "min", label: "Minimum agents", min: 1, max: 20 },
    { key: "max", label: "Maximum agents", min: 1, max: 20 },
    { key: "seed", label: "Random seed", min: 0 },
    { key: "cpu", label: "CPU capacity (cores)", min: 1 },
    { key: "ram", label: "RAM capacity (GB)", min: 1 },
    { key: "tokens", label: "Token budget", min: 1 },
  ];
  return (
    <>
      <PageHeading
        title="Workload Manager"
        description="Configure resource limits and generate reproducible agent workloads."
      >
        <span className="status-badge text-cyan">Mock workload</span>
      </PageHeading>
      <div className="mb-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat
          label="Generated agents"
          value={agents.length}
          icon={<Layers />}
          foot={`workload WL-${String(workloadVersion).padStart(3, "0")}`}
        />
        <Stat
          label="CPU requested"
          value={`${agents.reduce((n, a) => n + a.cpu, 0)} cores`}
          icon={<Cpu />}
          foot={`${config.cpu} cores system capacity`}
        />
        <Stat
          label="RAM requested"
          value={`${agents.reduce((n, a) => n + a.ram, 0)} GB`}
          icon={<MemoryStick />}
          color="text-cyan"
          foot={`${config.ram} GB system capacity`}
        />
        <Stat
          label="Token demand"
          value={agents.reduce((n, a) => n + a.tokens, 0).toLocaleString()}
          icon={<Coins />}
          color="text-violet"
          foot={`${config.tokens.toLocaleString()} token budget`}
        />
      </div>
      <Panel
        title="Workload configuration"
        subtitle="A fixed seed produces the same resource requirements."
        action={<SlidersHorizontal size={16} className="text-muted-foreground" />}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
            {fields.map((field) => (
              <Field key={field.key} label={field.label}>
                <input
                  className="field-input"
                  type="number"
                  min={field.min}
                  {...(field.max ? { max: field.max } : {})}
                  required
                  value={draft[field.key]}
                  onChange={(e) => update(field.key, Number(e.target.value))}
                />
              </Field>
            ))}
            <Field label="Generation mode">
              <select
                className="field-input"
                value={draft.mode}
                onChange={(e) =>
                  setDraft((current) => ({
                    ...current,
                    mode: e.target.value === "Sample" ? "Sample" : "Random",
                  }))
                }
              >
                <option>Random</option>
                <option>Sample</option>
              </select>
            </Field>
          </div>
          {error && (
            <p role="alert" className="mt-4 text-xs text-destructive">
              {error}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t pt-5">
            <Button type="submit">
              <Plus />
              Generate workload
            </Button>
            <Button type="button" variant="outline" onClick={() => submit(true)}>
              <RefreshCw />
              Regenerate workload
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="sm:ml-auto"
              onClick={() => {
                setDraft({ ...defaults });
                setError("");
                toast.info("Configuration restored. Generate to replace the workload.");
              }}
            >
              <RotateCcw />
              Reset configuration
            </Button>
          </div>
        </form>
      </Panel>
      <div className="mt-5">
        <Panel
          title="Generated agents"
          subtitle={`WL-${String(workloadVersion).padStart(3, "0")} · ${config.mode} generation · Seed ${config.seed}`}
          action={
            <span className="flex items-center gap-1.5 text-[10px] text-success">
              <Sparkles size={12} />
              {agents.length} agents
            </span>
          }
          body={false}
        >
          <AgentTable />
        </Panel>
      </div>
    </>
  );
}
