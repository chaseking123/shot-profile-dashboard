/*
This component renders the dashboard's two-button sidebar navigation for switching between views.
It applies the active-state styling and forwards selection changes to the parent shell.
*/
import "./SidebarNav.css";

import { Activity, BarChart3 } from "lucide-react";

import type { DashboardView } from "../../context/dashboardState";

type SidebarNavProps = {
  activeView: DashboardView;
  onChangeView: (view: DashboardView) => void;
};

function getButtonClassName(isActive: boolean) {
  return `sidebar-nav__button${isActive ? " sidebar-nav__button--active" : ""}`;
}

export function SidebarNav({ activeView, onChangeView }: SidebarNavProps) {
  return (
    <aside className="sidebar-nav" aria-label="Dashboard navigation">
      <button
        type="button"
        className={getButtonClassName(activeView === "shot-type")}
        onClick={() => onChangeView("shot-type")}
        aria-pressed={activeView === "shot-type"}
      >
        <BarChart3 size={20} />
        <span>Shot Type</span>
      </button>

      <button
        type="button"
        className={getButtonClassName(activeView === "efficiency")}
        onClick={() => onChangeView("efficiency")}
        aria-pressed={activeView === "efficiency"}
      >
        <Activity size={20} />
        <span>Efficiency</span>
      </button>
    </aside>
  );
}
