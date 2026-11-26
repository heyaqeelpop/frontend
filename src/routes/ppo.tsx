import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BrainCircuit, Play, CheckCircle2, ArrowRight, Info, Box, Layers, Bot } from "lucide-react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeading, Panel, Field, Stat } from "@/components/dashboard-ui";
import { pageMeta } from "@/lib/page-meta";
import { latestPpoModel as v5 } from "@/lib/backend-contract";
export const Route = createFileRoute("/ppo")({
  head: () =>
    pageMeta(
      "PPO Model",
      "Inspect provided PPO model specifications and illustrative frontend evaluation results without inference or training.",
    ),
  component: PPO,
});
const rewards = Array.from({ length: 21 }, (_, i) => ({
  step: i * 5000,
  v1: Math.round(-38 + i * 2.3 + Math.sin(i * 1.8) * 5),
  v2: Math.round(-48 + i * 3.7 + Math.sin(i) * 6),
}));
function PPO() {
  const [model, setModel] = useState<string>(v5.version);
  const [evaluated, setEvaluated] = useState(false);
  return (
    <>
      <PageHeading
        title="PPO Model"
        description="Inspect model specifications and explore illustrative policy evaluation."
      >
        <Button
          onClick={() => {
            setEvaluated(true);
            toast.success(
              `${model} evaluation results displayed. No inference performed in the browser.`,
            );
          }}
        >
          <Play />
          Evaluate model
        </Button>
      </PageHeading>
      <div className="mb-5 flex items-start gap-3 rounded-md border border-violet/20 bg-violet/5 p-4 text-violet">
        <Info size={16} className="shrink-0" />
        <p className="text-[11px] leading-6">
          {v5.version} is the latest trained model; its details and evaluation come from the
          reported training run. PPO v1 and v2 are historical versions. The training chart and v1/v2
          evaluation values are illustrative demo data. No model is loaded or executed in the
          browser.
        </p>
      </div>
      <div className="mb-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[
          {
            name: v5.version,
            subtitle: "Latest trained model",
            agents: "1–20 agents",
            workload: "Randomized workloads",
            steps: v5.timesteps.toLocaleString(),
            extra: [
              ["Training seed", String(v5.seed)],
              ["Model file", v5.file],
              [
                "Evaluation",
                `${v5.evaluation.episodes} episodes · seed ${v5.evaluation.seed.toLocaleString()}`,
              ],
            ],
          },
          {
            name: "PPO v1",
            subtitle: "Historical version · original model",
            extra: [],
            agents: "5 agents",
            workload: "Fixed sample workload",
            steps: "Not provided",
          },
          {
            name: "PPO v2",
            subtitle: "Historical version · expanded model",
            extra: [],
            agents: "Up to 20 agents",
            workload: "Randomized workloads",
            steps: "100,352",
          },
        ].map((item) => (
          <Panel
            key={item.name}
            title={item.name}
            subtitle={item.subtitle}
            action={
              <BrainCircuit
                size={23}
                className={item.name === v5.version ? "text-violet" : "text-primary"}
              />
            }
          >
            <div className="mb-5 flex items-center gap-2">
              <span className="status-badge text-success">Trained</span>
              <span className="text-[9px] text-muted-foreground">
                {item.name === v5.version ? "Latest · reported status" : "Historical version"}
              </span>
            </div>
            <dl className="space-y-4 text-xs">
              {[
                ["Supported workload", item.agents],
                ["Workload type", item.workload],
                ["Training timesteps", item.steps],
                ...item.extra,
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-mono text-[11px]">{value}</dd>
                </div>
              ))}
            </dl>
            <Button
              variant={model === item.name ? "secondary" : "outline"}
              className="mt-6 w-full"
              onClick={() => {
                setModel(item.name);
                setEvaluated(false);
              }}
            >
              {model === item.name ? <CheckCircle2 /> : <BrainCircuit />}
              {model === item.name ? "Selected for evaluation" : `Select ${item.name}`}
            </Button>
          </Panel>
        ))}
      </div>
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Stat
          label="V5 observation space"
          value={v5.observationSpace}
          icon={<Box />}
          foot="dimensions"
        />
        <Stat
          label="V5 action space"
          value={v5.actionSpace}
          icon={<Bot />}
          color="text-cyan"
          foot="discrete actions"
        />
        <Stat
          label="V5 training timesteps"
          value={v5.timesteps.toLocaleString()}
          icon={<Layers />}
          color="text-violet"
          foot={`training seed ${v5.seed}`}
        />
      </div>
      <Panel
        title="Policy architecture overview"
        subtitle="Conceptual PPO pipeline · exact hidden-layer sizes were not supplied"
      >
        <div className="flex flex-col items-center justify-between gap-4 py-4 sm:flex-row">
          {[
            "Observation vector",
            "Actor–critic policy",
            "Action distribution",
            "Agent selection",
          ].map((label, i) => (
            <div className="flex w-full items-center gap-3 sm:w-auto" key={label}>
              <div className="flex flex-1 flex-col items-center gap-2 rounded-md border bg-muted/40 px-4 py-5 text-center">
                <BrainCircuit size={20} className={i === 1 ? "text-violet" : "text-primary"} />
                <span className="text-[11px] font-semibold">{label}</span>
                <span className="font-mono text-[9px] text-muted-foreground">
                  {
                    [
                      "165 dimensions (V5)",
                      "Conceptual network",
                      "21 actions (V5)",
                      "20 agents + skip",
                    ][i]
                  }
                </span>
              </div>
              {i < 3 && (
                <ArrowRight className="hidden shrink-0 text-muted-foreground sm:block" size={17} />
              )}
            </div>
          ))}
        </div>
      </Panel>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Panel
          title="Training reward vs. timesteps"
          subtitle="Historical versions v1 and v2 · illustrative demo curve, not recorded training data"
          action={
            <span className="rounded border border-violet/20 px-2 py-1 font-mono text-[9px] text-violet">
              DEMO
            </span>
          }
        >
          <div className="mb-4 flex gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="legend-dot text-primary" />
              PPO v1
            </span>
            <span className="flex items-center gap-2">
              <span className="legend-dot text-violet" />
              PPO v2
            </span>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rewards} margin={{ top: 10, left: -25, right: 15, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 5" />
                <XAxis
                  dataKey="step"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 9 }}
                  tickFormatter={(v) => `${v / 1000}k`}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={35}
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className="chart-tooltip">
                        {label} timesteps
                        {payload.map((p) => (
                          <p key={p.name}>
                            {p.name}: {p.value}
                          </p>
                        ))}
                      </div>
                    ) : null
                  }
                />
                <Line
                  type="monotone"
                  dataKey="v1"
                  name="PPO v1"
                  stroke="var(--primary)"
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="v2"
                  name="PPO v2"
                  stroke="var(--violet)"
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel
          title="Model evaluation"
          subtitle={
            model === v5.version
              ? `${model} · reported evaluation results`
              : `${model} · historical version · demo evaluation`
          }
        >
          <Field label="Evaluation model">
            <select
              className="field-input"
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setEvaluated(false);
              }}
            >
              <option>{v5.version}</option>
              <option>PPO v1</option>
              <option>PPO v2</option>
            </select>
          </Field>
          {evaluated ? (
            <div className="mt-6 space-y-5 text-xs">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 size={15} />
                {model === v5.version ? "Reported evaluation" : "Historical version"}
              </div>
              {(model === v5.version
                ? [
                    ["Completion rate", `${v5.evaluation.completionRate}%`],
                    ["Mean reward", String(v5.evaluation.meanReward)],
                    ["Evaluation episodes", String(v5.evaluation.episodes)],
                    ["Evaluation seed", v5.evaluation.seed.toLocaleString()],
                  ]
                : [
                    [
                      "Completion rate",
                      model === "PPO v2" ? "27.5% (historical comparison)" : "Not provided",
                    ],
                    ["Average reward", "Not provided"],
                    [
                      "Average makespan",
                      model === "PPO v2" ? "47.4s (historical comparison)" : "Not provided",
                    ],
                  ]
              ).map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono">{value}</span>
                </div>
              ))}
              <p className="border-t pt-4 text-[10px] leading-5 text-muted-foreground">
                {model === v5.version
                  ? `Reported results from the ${v5.version} evaluation run (${v5.evaluation.episodes} episodes, seed ${v5.evaluation.seed.toLocaleString()}). Not computed in the browser.`
                  : "Historical version. Only PPO v2 completion and makespan from the historical comparison are available; no other evaluation figures were recorded."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-10 text-center">
              <BrainCircuit size={32} className="text-violet" />
              <p className="mt-4 text-xs text-muted-foreground">No evaluation selected</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-5"
                onClick={() => setEvaluated(true)}
              >
                <Play />
                Evaluate model
              </Button>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
