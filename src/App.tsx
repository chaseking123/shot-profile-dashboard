/*
This file selects which dashboard view to render and handles the top-level loading and error states.
It also wraps the application in the shared dashboard context provider.
*/
import "./App.css";
import { DashboardShell } from "./components/layout/DashboardShell";
import { PageHeader } from "./components/layout/PageHeader";
import { Button } from "./components/ui/Button";
import { EfficiencyView } from "./components/views/EfficiencyView";
import { ShotTypeView } from "./components/views/ShotTypeView";
import { DashboardProvider, useDashboardContext } from "./context/DashboardContext";

function DashboardApp() {
  const { activeView, setActiveView, isLoading, error, dataWarning, retryDashboardData } =
    useDashboardContext();
  const pageTitle = activeView === "shot-type" ? "Shot Type" : "Efficiency";

  return (
    <DashboardShell activeView={activeView} onChangeView={setActiveView}>
      {error ? (
        <section className="dashboard-view">
          <PageHeader title={pageTitle} />
          <div className="dashboard-card dashboard-card--error">
            <h2>Failed to load dashboard data</h2>
            <p>{error}</p>
            <Button onClick={retryDashboardData}>Retry</Button>
          </div>
        </section>
      ) : isLoading ? (
        <section className="dashboard-view">
          <PageHeader title={pageTitle} />
          <div className="dashboard-card">
            <h2>Loading dashboard data...</h2>
          </div>
        </section>
      ) : activeView === "shot-type" ? (
        <>
          {dataWarning ? (
            <div className="dashboard-card dashboard-card--warning">
              <h2>Data quality warning</h2>
              <p>{dataWarning}</p>
            </div>
          ) : null}
          <ShotTypeView />
        </>
      ) : (
        <>
          {dataWarning ? (
            <div className="dashboard-card dashboard-card--warning">
              <h2>Data quality warning</h2>
              <p>{dataWarning}</p>
            </div>
          ) : null}
          <EfficiencyView />
        </>
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
