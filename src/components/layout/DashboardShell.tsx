import "./DashboardShell.css";

import type { ReactNode } from "react";

import type { DashboardView } from "../../context/dashboardState";
import { SidebarNav } from "./SidebarNav";

type DashboardShellProps = {
  activeView: DashboardView;
  onChangeView: (view: DashboardView) => void;
  children: ReactNode;
};

export function DashboardShell({ activeView, onChangeView, children }: DashboardShellProps) {
  return (
    <div className="dashboard-shell">
      <SidebarNav activeView={activeView} onChangeView={onChangeView} />
      <main className="dashboard-shell__content">{children}</main>
    </div>
  );
}
