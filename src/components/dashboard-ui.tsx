import { cloneElement, isValidElement, useId, useState, type ReactNode } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Search,
  X,
  Cpu,
  MemoryStick,
  Coins,
  ArrowDownUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResources } from "./resource-provider";
import { history, type Agent, type AgentStatus } from "@/lib/demo";

export function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
  body = true,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  body?: boolean;
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-head">
        <div>
          <h2 className="panel-title">{title}</h2>
          {subtitle && <p className="panel-subtitle">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className={body ? "panel-body" : "pt-5"}>{children}</div>
    </section>
  );
}
export function PageHeading({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="mb-2 flex items-center gap-2 font-mono text-[9px] text-muted-foreground">
          <span className="status-dot text-cyan" />
          RESOURCE MANAGEMENT CONSOLE
        </div>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 pt-1">{children}</div>
    </div>
  );
}
export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`status-badge status-${status}`}>
      {status === "Pending" ? "Waiting" : status}
    </span>
  );
}
export function Stat({
  label,
  value,
  icon,
  color = "text-primary",
  foot,
  trend,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  foot: string;
  trend?: string;
}) {
  return (
    <div className="panel stat-card">
      <div className="flex items-center justify-between gap-2">
        <span className="stat-label">{label}</span>
        <span className={`stat-icon ${color}`}>{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-bottom">
        {trend && (
          <span className="inline-flex items-center gap-1 text-success">
            <ArrowUpRight size={11} />
            {trend}
          </span>
        )}
        {foot}
      </div>
    </div>
  );
}
export function Field({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  const control =
    isValidElement<{ id?: string }>(children) &&
    typeof children.type === "string" &&
    ["input", "select", "textarea"].includes(children.type)
      ? cloneElement(children, { id })
      : children;
  return (
    <div className="block min-w-0">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {control}
    </div>
  );
}
export function Gauge({
  value,
  label,
  color = "",
}: {
  value: number;
  label: string;
  color?: string;
}) {
  const bounded = Math.max(0, Math.min(100, value));
  return (
    <div className={`gauge ${color}`}>
      <svg viewBox="0 0 144 144" aria-label={`${label}: ${bounded}%`}>
        <circle className="gauge-track" cx="72" cy="72" r="57" />
        <circle
          className="gauge-fill"
          cx="72"
          cy="72"
          r="57"
          strokeDasharray={`${(bounded / 100) * 358.14} 358.14`}
        />
      </svg>
      <div className="gauge-value">
        {bounded}%<small>{label}</small>
      </div>
    </div>
  );
}
export function ResourceOverview({ large = false }: { large?: boolean }) {
  const { config, resources } = useResources();
  const items = [
    {
      name: "CPU utilization",
      value: resources.cpuPercent,
      allocated: resources.cpu,
      total: config.cpu,
      unit: "cores",
      color: "",
      text: "text-primary",
      icon: Cpu,
    },
    {
      name: "RAM utilization",
      value: resources.ramPercent,
      allocated: resources.ram,
      total: config.ram,
      unit: "GB",
      color: "cyan",
      text: "text-cyan",
      icon: MemoryStick,
    },
    {
      name: "Token budget",
      value: resources.tokenPercent,
      allocated: resources.tokens,
      total: config.tokens,
      unit: "tokens",
      color: "violet",
      text: "text-violet",
      icon: Coins,
    },
  ];
  if (large)
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <Panel
            key={item.name}
            title={item.name}
            action={<item.icon size={17} className={item.text} />}
          >
            <Gauge
              value={item.value}
              label={item.name === "Token budget" ? "Consumed" : "Allocated"}
              color={item.color}
            />
            <div className="mt-5 space-y-3 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Total capacity</span>
                <span className="font-mono text-foreground">
                  {item.total.toLocaleString()} {item.unit}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{item.unit === "tokens" ? "Consumed" : "Allocated"}</span>
                <span className={item.text}>
                  {item.allocated.toLocaleString()} {item.unit}
                </span>
              </div>
              <div className="flex justify-between border-t pt-3 text-muted-foreground">
                <span>Available</span>
                <span className="font-mono text-success">
                  {(item.total - item.allocated).toLocaleString()} {item.unit}
                </span>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    );
  return (
    <div className="space-y-6">
      {items.map((item) => (
        <div key={item.name}>
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <item.icon size={15} className={item.text} />
              {item.name}
            </span>
            <span className="font-mono text-xs">
              {item.value}
              <span className="text-muted-foreground">%</span>
            </span>
          </div>
          <progress className={`resource-progress ${item.color}`} value={item.value} max={100} />
          <div className="mt-2 flex justify-between font-mono text-[9px] text-muted-foreground">
            <span>
              {item.allocated.toLocaleString()} / {item.total.toLocaleString()} {item.unit}
            </span>
            <span>{(item.total - item.allocated).toLocaleString()} free</span>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 rounded-md border border-success/15 bg-success/5 px-3 py-2.5 text-[10px] text-success">
        <Check size={12} />
        Resources operating within capacity
      </div>
    </div>
  );
}
const axis = {
  stroke: "var(--muted-foreground)",
  tickLine: false,
  axisLine: false,
  tick: { fill: "var(--muted-foreground)", fontSize: 9 },
};
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: readonly { name?: string; value?: number | string; color?: string }[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="text-muted-foreground">{label}</div>
      {payload.map((item, i) => (
        <p key={i}>
          {item.name}: <strong>{item.value}</strong>
        </p>
      ))}
    </div>
  );
}
export function UtilizationChart({
  mode = "both",
  short = false,
}: {
  mode?: "both" | "cpu" | "ram";
  short?: boolean;
}) {
  const { resourceHistory } = useResources();
  const data = resourceHistory.length ? resourceHistory : history;
  return (
    <div className={`chart-wrap ${short ? "short" : ""}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 15, right: 5, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id={`cpu-fill-${mode}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id={`ram-fill-${mode}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.12} />
              <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 5" />
          <XAxis dataKey="time" {...axis} minTickGap={45} dy={8} />
          <YAxis
            {...axis}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip content={<ChartTooltip />} />
          {mode !== "ram" && (
            <Area
              type="monotone"
              dataKey="cpu"
              name="CPU"
              stroke="var(--primary)"
              strokeWidth={2.2}
              fill={`url(#cpu-fill-${mode})`}
              isAnimationActive={false}
            />
          )}
          {mode !== "cpu" && (
            <Area
              type="monotone"
              dataKey="ram"
              name="RAM"
              stroke="var(--cyan)"
              strokeWidth={2}
              fill={`url(#ram-fill-${mode})`}
              isAnimationActive={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
export function ActivityChart() {
  const { agents } = useResources();
  const finished = agents.filter((a) => a.status === "Completed").length;
  const failed = agents.filter((a) => a.status === "Failed").length;
  const data = history
    .slice(-10)
    .map((row, i) => ({
      ...row,
      completed: Math.min(finished, row.completed),
      failed: i % 4 === 0 ? failed : 0,
    }));
  return (
    <div className="chart-wrap short">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -25, right: 0, top: 10, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 5" />
          <XAxis dataKey="time" {...axis} minTickGap={30} />
          <YAxis {...axis} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} />
          <Bar
            dataKey="completed"
            name="Completed"
            fill="var(--primary)"
            radius={[3, 3, 0, 0]}
            maxBarSize={17}
          />
          <Bar
            dataKey="failed"
            name="Failed"
            fill="var(--destructive)"
            radius={[3, 3, 0, 0]}
            maxBarSize={17}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
export function StatusDonut() {
  const { agents } = useResources();
  const statuses: AgentStatus[] = ["Completed", "Running", "Pending", "Failed"];
  const colors = ["var(--success)", "var(--primary)", "var(--warning)", "var(--destructive)"];
  const data = statuses.map((status) => ({
    name: status,
    value: agents.filter((a) => a.status === status).length,
  }));
  return (
    <div>
      <div className="donut-wrap">
        <div className="chart-wrap donut">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={65}
                outerRadius={79}
                paddingAngle={5}
                stroke="none"
                startAngle={90}
                endAngle={-270}
                isAnimationActive={false}
              >
                {data.map((item, i) => (
                  <Cell key={item.name} fill={colors[i] ?? colors[0]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="donut-center">
          {agents.length}
          <small>Total agents</small>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
        {data.map((row) => (
          <div key={row.name} className="flex items-center justify-between text-[10px]">
            <span className={`flex items-center gap-2 status-${row.name}`}>
              <span className="legend-dot" />
              <span className="text-muted-foreground">
                {row.name === "Pending" ? "Waiting" : row.name}
              </span>
            </span>
            <span className="font-mono">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
export function MetricBarChart({
  data,
  metric,
  label,
}: {
  data: { algorithm: string; [key: string]: string | number }[];
  metric: string;
  label: string;
}) {
  const colors = ["var(--primary)", "var(--cyan)", "var(--violet)", "var(--success)"];
  return (
    <div className="chart-wrap short">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -15, right: 10, top: 8, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 5" />
          <XAxis
            dataKey="algorithm"
            {...axis}
            interval={0}
            tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
          />
          <YAxis {...axis} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey={metric} name={label} radius={[4, 4, 0, 0]} maxBarSize={42}>
            {data.map((row, i) => (
              <Cell key={row.algorithm} fill={colors[i] ?? "var(--primary)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
export function AgentTable({ detailed = false }: { detailed?: boolean }) {
  const { agents } = useResources();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState<"id" | "priority" | "cpu">("id");
  const [descending, setDescending] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = agents.find((a) => a.id === selectedId);
  const filtered = agents
    .filter(
      (a) =>
        (status === "All" || a.status === status) &&
        `${a.id} ${a.task}`.toLowerCase().includes(search.toLowerCase()),
    )
    .sort(
      (a, b) =>
        (sort === "id" ? a.id.localeCompare(b.id) : a[sort] - b[sort]) * (descending ? -1 : 1),
    );
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-5">
        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={14} />
          <input
            aria-label="Search agents"
            placeholder="Search agents by ID or task..."
            className="field-input pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {detailed ? (
            ["All", "Running", "Pending", "Completed", "Failed"].map((s) => (
              <Button
                size="sm"
                key={s}
                variant={status === s ? "secondary" : "ghost"}
                onClick={() => setStatus(s)}
              >
                {s === "Pending" ? "Waiting" : s}
                {s !== "All" && (
                  <span className="text-muted-foreground">
                    {agents.filter((a) => a.status === s).length}
                  </span>
                )}
              </Button>
            ))
          ) : (
            <select
              aria-label="Filter agent status"
              className="field-input w-36"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="All">All statuses</option>
              {["Pending", "Running", "Completed", "Failed"].map((s) => (
                <option key={s} value={s}>
                  {s === "Pending" ? "Waiting" : s}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-5"
                  onClick={() => {
                    setSort("id");
                    setDescending(sort === "id" ? !descending : false);
                  }}
                >
                  Agent ID
                  <ArrowDownUp size={11} />
                </Button>
              </th>
              <th>Task name</th>
              <th>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-5"
                  onClick={() => {
                    setSort("cpu");
                    setDescending(sort === "cpu" ? !descending : false);
                  }}
                >
                  CPU
                  <ArrowDownUp size={11} />
                </Button>
              </th>
              <th>RAM</th>
              <th>Tokens</th>
              <th>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-5"
                  onClick={() => {
                    setSort("priority");
                    setDescending(sort === "priority" ? !descending : true);
                  }}
                >
                  Priority
                  <ChevronDown size={11} />
                </Button>
              </th>
              <th>Deadline</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((agent) => (
              <tr
                key={agent.id}
                className="clickable"
                onClick={() => setSelectedId(agent.id)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSelectedId(agent.id);
                }}
                aria-label={`View agent ${agent.id}`}
              >
                <td>
                  <span className="font-mono text-primary">{agent.id}</span>
                </td>
                <td>{agent.task}</td>
                <td className="font-mono text-muted-foreground">{agent.cpu} cores</td>
                <td className="font-mono text-muted-foreground">{agent.ram} GB</td>
                <td className="font-mono text-muted-foreground">{agent.tokens.toLocaleString()}</td>
                <td>
                  <span className={agent.priority >= 4 ? "text-violet" : "text-muted-foreground"}>
                    P{agent.priority}
                  </span>
                </td>
                <td className="font-mono text-muted-foreground">{agent.deadline}s</td>
                <td>
                  <StatusBadge status={agent.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <div className="py-14 text-center text-muted-foreground">
            No agents match these filters.
          </div>
        )}
      </div>
      <div className="flex justify-between border-t px-5 py-3 text-[10px] text-muted-foreground">
        <span>
          Showing {filtered.length} of {agents.length} agents
        </span>
        <span>Workload resource requirements</span>
      </div>
      {selected && <AgentDetail agent={selected} onClose={() => setSelectedId(null)} />}
    </>
  );
}
function AgentDetail({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const allocated = agent.status === "Running";
  return (
    <>
      <div className="detail-overlay" onClick={onClose} />
      <aside
        className="detail-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Agent ${agent.id} details`}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-primary">AGENT DETAILS</span>
          <Button variant="ghost" size="icon" aria-label="Close agent details" onClick={onClose}>
            <X />
          </Button>
        </div>
        <h2 className="mt-8 text-2xl font-bold">{agent.id}</h2>
        <p className="mb-5 mt-2 text-muted-foreground">{agent.task}</p>
        <StatusBadge status={agent.status} />
        <h3 className="mb-5 mt-9 font-semibold">Resource requirements</h3>
        <dl className="space-y-4 text-xs">
          {[
            ["CPU required", `${agent.cpu} cores`],
            ["RAM required", `${agent.ram} GB`],
            ["Tokens required", agent.tokens.toLocaleString()],
            ["CPU allocated", `${allocated ? agent.cpu : 0} cores`],
            ["RAM allocated", `${allocated ? agent.ram : 0} GB`],
            ["Priority", `P${agent.priority}`],
            ["Deadline", `${agent.deadline}s`],
            ["Execution duration", `${agent.duration}s`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-mono">{value}</dd>
            </div>
          ))}
        </dl>
        <h3 className="mb-4 mt-9 border-t pt-7 font-semibold">Event history</h3>
        {agent.history.map((event, i) => (
          <div
            key={i}
            className="flex gap-3 border-l py-3 pl-4 text-xs leading-6 text-muted-foreground"
          >
            <span className="font-mono text-primary">{String(i + 1).padStart(2, "0")}</span>
            {event}
          </div>
        ))}
      </aside>
    </>
  );
}
