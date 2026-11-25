import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Save, RotateCcw, Moon, Sun, Settings2, Check, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeading, Panel, Field } from "@/components/dashboard-ui";
import { useResources } from "@/components/resource-provider";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/settings")({
  head: () =>
    pageMeta(
      "Settings",
      "Configure frontend demo appearance, default resource capacities, agent count, and simulation speed.",
    ),
  component: Settings,
});
function Settings() {
  const { config, setConfig, theme, setTheme, resetAll } = useResources();
  const [draft, setDraft] = useState({ ...config });
  const [confirm, setConfirm] = useState(false);
  const save = () => {
    setConfig({
      ...draft,
      min: Math.min(draft.min, draft.count),
      max: Math.max(draft.max, draft.count),
    });
    toast.success("Demo settings saved for this session");
  };
  return (
    <>
      <PageHeading
        title="Settings"
        description="Customize your workspace and the default simulation environment."
      >
        <Button onClick={save}>
          <Save />
          Save settings
        </Button>
      </PageHeading>
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          <Panel title="Appearance" subtitle="Choose a theme for the entire workspace">
            <div className="flex gap-3">
              {(["Dark", "Light"] as const).map((t) => (
                <Button
                  variant={theme === t ? "secondary" : "outline"}
                  className="h-12 flex-1"
                  key={t}
                  onClick={() => setTheme(t)}
                >
                  {t === "Dark" ? <Moon /> : <Sun />}
                  {t}
                  {theme === t && <Check size={13} />}
                </Button>
              ))}
            </div>
          </Panel>
          <Panel
            title="Default resource capacity"
            subtitle="Saving updates resource limits without replacing your generated agents."
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                {[
                  { key: "cpu", label: "Default CPU capacity (cores)", min: 1, max: 128 },
                  { key: "ram", label: "Default RAM capacity (GB)", min: 1, max: 512 },
                  { key: "tokens", label: "Default token budget", min: 1, max: 1000000 },
                  { key: "count", label: "Default number of agents", min: 1, max: 20 },
                ].map(({ key, label, min, max }) => {
                  const k = key as "cpu" | "ram" | "tokens" | "count";
                  return (
                    <Field key={key} label={label}>
                      <input
                        className="field-input"
                        type="number"
                        min={min}
                        max={max}
                        value={draft[k]}
                        required
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            [k]: Math.max(min, Math.min(max, Number(e.target.value))),
                          }))
                        }
                      />
                    </Field>
                  );
                })}
              </div>
              <div className="mt-6 border-t pt-5">
                <Field label={`Simulation speed · ${draft.speed}×`}>
                  <input
                    aria-label="Simulation speed"
                    type="range"
                    min={0.5}
                    max={3}
                    step={0.5}
                    value={draft.speed}
                    className="w-full accent-primary"
                    onChange={(e) => setDraft((d) => ({ ...d, speed: Number(e.target.value) }))}
                  />
                  <div className="mt-2 flex justify-between font-mono text-[9px] text-muted-foreground">
                    <span>0.5×</span>
                    <span>1× normal</span>
                    <span>3× fast</span>
                  </div>
                </Field>
              </div>
              <Button type="submit" className="mt-6" variant="outline">
                <Save />
                Apply defaults
              </Button>
            </form>
          </Panel>
          <Panel
            title="Reset demo environment"
            subtitle="Restore the initial workload, resource defaults, and simulation state."
          >
            <p className="mb-5 text-[11px] leading-6 text-muted-foreground">
              This replaces the current agents with the original 12-agent demo workload. It stops
              monitoring and any running simulation.
            </p>
            {confirm ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs text-warning">Reset the current demo?</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    resetAll();
                    setDraft({
                      cpu: 16,
                      ram: 32,
                      tokens: 24000,
                      count: 12,
                      min: 5,
                      max: 20,
                      seed: 42,
                      mode: "Random",
                      speed: 1,
                    });
                    setConfirm(false);
                    toast.success("Initial demo data restored");
                  }}
                >
                  Confirm reset
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirm(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setConfirm(true)}>
                <RotateCcw />
                Reset demo data
              </Button>
            )}
          </Panel>
        </div>
        <div>
          <Panel
            title="Environment information"
            subtitle="AI Agent Resource Manager"
            action={<Settings2 size={16} className="text-muted-foreground" />}
          >
            <dl className="space-y-5 text-xs">
              {[
                ["Environment", "Frontend demo"],
                ["Application version", "2.0.0"],
                ["Backend connection", "Not connected"],
                ["Model inference", "Disabled"],
                ["Data persistence", "Current session only"],
                ["Supported algorithms", "4"],
              ].map(([label, value]) => (
                <div className="flex justify-between gap-3" key={label}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-mono text-[10px]">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex items-start gap-2 border-t pt-5 text-[10px] leading-6 text-muted-foreground">
              <Info size={13} className="mt-1 shrink-0 text-cyan" />
              All settings are held in memory. Reloading the page restores the initial demo.
              Agent-count changes apply the next time you generate a workload.
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
