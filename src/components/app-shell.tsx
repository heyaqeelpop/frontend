import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Layers,
  Bot,
  Cpu,
  Workflow,
  ChartNoAxesCombined,
  Network,
  BrainCircuit,
  FileChartColumn,
  Settings2,
  Bell,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  PanelLeft,
  Boxes,
  CircleHelp,
  ArrowUpRight,
  X,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResources } from "./resource-provider";
import { StatusBadge } from "./dashboard-ui";
const navigation = [
  { name: "Overview", path: "/", icon: LayoutDashboard },
  { name: "Workload Manager", path: "/workloads", icon: Layers },
  { name: "Agent Monitor", path: "/agents", icon: Bot },
  { name: "Resource Monitor", path: "/resources", icon: Cpu },
  { name: "Scheduler", path: "/scheduler", icon: Workflow },
  { name: "Algorithm Comparison", path: "/comparison", icon: ChartNoAxesCombined },
  { name: "Deadlock Monitor", path: "/deadlocks", icon: Network },
  { name: "PPO Model", path: "/ppo", icon: BrainCircuit },
  { name: "Reports & Analytics", path: "/reports", icon: FileChartColumn },
  { name: "Settings", path: "/settings", icon: Settings2 },
] as const;
export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [profile, setProfile] = useState(false);
  const [help, setHelp] = useState(false);
  const path = useRouterState({ select: (state) => state.location.pathname });
  const current = navigation.find((item) => item.path === path);
  const { simulation, events } = useResources();
  return (
    <div className={`${collapsed ? "sidebar-mini" : ""} ${mobile ? "mobile-open" : ""}`}>
      {mobile && (
        <div
          className="fixed inset-0 z-30 bg-background/80 md:hidden"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className="app-sidebar">
        <Link to="/" className="brand" onClick={() => setMobile(false)}>
          <Boxes className="brand-icon" />
          <div className={collapsed ? "md:hidden" : ""}>
            <div className="brand-name">
              AI Agent<span className="text-cyan">.</span>
            </div>
            <div className="brand-subtitle">Resource Manager</div>
          </div>
        </Link>
        <div className={`nav-caption ${collapsed ? "md:invisible" : ""}`}>WORKSPACE</div>
        <nav className="flex-1 overflow-y-auto">
          {navigation.map((item, i) => (
            <div key={item.path}>
              {i === 5 && (
                <div className={`nav-caption mt-5 ${collapsed ? "md:hidden" : ""}`}>
                  INTELLIGENCE & INSIGHTS
                </div>
              )}
              <Link
                to={item.path}
                title={collapsed ? item.name : undefined}
                className={`nav-link ${path === item.path ? "active" : ""}`}
                onClick={() => setMobile(false)}
              >
                <item.icon />
                <span className={collapsed ? "md:hidden" : ""}>{item.name}</span>
                {item.name === "PPO Model" && !collapsed && (
                  <span className="ml-auto rounded bg-violet/10 px-1.5 py-0.5 font-mono text-[8px] text-violet">
                    v2
                  </span>
                )}
              </Link>
            </div>
          ))}
        </nav>
        <div className="m-4 mt-8 border-t pt-4">
          <div className={collapsed ? "md:hidden" : ""}>
            <div className="flex items-center gap-2 text-[11px] font-semibold">
              <span className="status-dot text-success" />
              All systems operational
            </div>
            <div className="mt-2 font-mono text-[9px] text-muted-foreground">
              Frontend simulation environment
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Demo environment information"
              title="Demo environment information"
              onClick={() => setHelp(!help)}
            >
              <CircleHelp size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Close navigation"
              onClick={() => setMobile(false)}
            >
              <X />
            </Button>
          </div>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open navigation"
              onClick={() => setMobile(true)}
            >
              <PanelLeft />
            </Button>
            <span className="hidden text-[11px] text-muted-foreground sm:inline">Workspace</span>
            <span className="hidden text-muted-foreground/50 sm:inline">/</span>
            <span className="truncate text-[11px] font-semibold">
              {current?.name ?? "Overview"}
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden items-center gap-2 text-[10px] text-muted-foreground lg:flex">
              <span className="status-dot text-success" />
              System online
            </div>
            <div className="hidden border-l pl-5 sm:block">
              <StatusBadge status={simulation} />
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              title="Notifications"
              className="icon-button relative"
              onClick={() => {
                setNotifications(!notifications);
                setProfile(false);
              }}
            >
              <Bell size={17} />
              <span className="absolute right-2 top-1.5 size-1.5 rounded-full bg-primary" />
            </Button>
            <Button
              variant="ghost"
              className="gap-2 px-1"
              aria-label="User profile"
              onClick={() => {
                setProfile(!profile);
                setNotifications(false);
              }}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-violet/30 bg-violet/15 font-mono text-[10px] text-violet">
                AA
              </span>
              <ChevronDown size={12} className="text-muted-foreground" />
            </Button>
          </div>
        </header>
        {notifications && (
          <div className="notification-popover">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Notifications</h2>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close notifications"
                onClick={() => setNotifications(false)}
              >
                <X />
              </Button>
            </div>
            {events.slice(0, 4).map((event, i) => (
              <div className="event-row" key={i}>
                <CheckCircle2 className={`status-${event.type}`} size={15} />
                <div className="event-text">
                  {event.text}
                  <div className="event-time">
                    {event.time} · {event.agent}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {profile && (
          <div className="notification-popover w-60">
            <div className="font-semibold">Workspace administrator</div>
            <div className="mt-1 text-xs text-muted-foreground">Local demo profile</div>
            <Button variant="ghost" asChild className="mt-4 w-full justify-start">
              <Link to="/settings" onClick={() => setProfile(false)}>
                <Settings2 />
                Workspace settings
              </Link>
            </Button>
          </div>
        )}
        <main className="page-content">
          {help && (
            <div className="mb-5 flex items-start justify-between gap-5 rounded-md border border-cyan/20 bg-cyan/5 p-4 text-xs text-cyan">
              <p>
                Demo environment. All agents, resource measurements, model evaluations, and
                execution events are simulated in your browser. No Python backend or live AI model
                is connected.
              </p>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close information"
                onClick={() => setHelp(false)}
              >
                <X />
              </Button>
            </div>
          )}
          {children}
          <footer className="app-footer">
            <span className="flex items-center gap-2">
              <Activity size={11} />
              AI Agent Resource Manager<span className="text-border">|</span>A mini OS for AI agents
            </span>
            <span className="flex items-center gap-2">
              <span className="status-dot text-cyan" />
              Demo environment<span className="text-border">·</span>
              <span className="font-mono">v2.0.0</span>
              <ArrowUpRight size={10} />
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
