import "./App.css";
import { DashboardShell } from "./components/layout/DashboardShell";
import { PageHeader } from "./components/layout/PageHeader";
import { EfficiencyView } from "./components/views/EfficiencyView";
import { ShotTypeView } from "./components/views/ShotTypeView";
import { DashboardProvider, useDashboardContext } from "./context/DashboardContext";

function DashboardApp() {
  const { activeView, setActiveView, isLoading, error } = useDashboardContext();

  return (
    <DashboardShell activeView={activeView} onChangeView={setActiveView}>
      {error ? (
        <section className="dashboard-view">
          <PageHeader title={activeView === "shot-type" ? "Shot Type" : "Efficiency"} />
          <div className="dashboard-card dashboard-card--error">
            <h2>Failed to load dashboard data</h2>
            <p>{error}</p>
          </div>
        </section>
      ) : isLoading ? (
        <section className="dashboard-view">
          <PageHeader title={activeView === "shot-type" ? "Shot Type" : "Efficiency"} />
          <div className="dashboard-card">
            <h2>Loading dashboard data...</h2>
          </div>
        </section>
      ) : activeView === "shot-type" ? (
        <ShotTypeView />
      ) : (
        <EfficiencyView />
      )}
    </DashboardShell>
  );
}

function App() {
  return (
    <DashboardProvider>
      <DashboardApp />
    </DashboardProvider>
  );
}

export default App;
