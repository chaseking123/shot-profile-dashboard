import "./App.css";

import { useEffect, useMemo, useState } from "react";

import { DivergingCompareChart } from "./components/charts/DivergingCompareChart";
import { ShotTypeStackedBarChart } from "./components/charts/ShotTypeStackedBarChart";
import { FilterToolbar } from "./components/filters/FilterToolbar";
import { DashboardShell } from "./components/layout/DashboardShell";
import { PageHeader } from "./components/layout/PageHeader";
import { DashboardProvider, useDashboardContext } from "./context/DashboardContext";
import { buildShotTypePlayerComparisonFromRows } from "./data/transforms/shotAggregations";

function ShotTypeView() {
  const {
    filters,
    pendingFilters,
    shotTypeRows,
    compareSelections,
    filterOptions,
    setCompareSelection,
    setPendingFilters,
    applyFilters,
    resetFilters,
  } = useDashboardContext();
  const comparePlayerOptions = useMemo(
    () =>
      shotTypeRows
        .filter((row) => !row.isTeamAverage)
        .map((row) => ({
          shooterId: row.shooterId,
          shooterName: row.shooterName,
        })),
    [shotTypeRows],
  );
  const availablePlayerIds = new Set(comparePlayerOptions.map((player) => player.shooterId));
  const fallbackPlayer1Id = comparePlayerOptions[0]?.shooterId ?? "";
  const fallbackPlayer2Id = comparePlayerOptions[1]?.shooterId ?? fallbackPlayer1Id;
  const syncedPlayer1Id = availablePlayerIds.has(compareSelections.shotType.player1Id)
    ? compareSelections.shotType.player1Id
    : fallbackPlayer1Id;
  const syncedPlayer2Id = availablePlayerIds.has(compareSelections.shotType.player2Id)
    ? compareSelections.shotType.player2Id
    : fallbackPlayer2Id;
  const [localCompareSelection, setLocalCompareSelection] = useState({
    player1Id: syncedPlayer1Id,
    player2Id: syncedPlayer2Id,
  });

  useEffect(() => {
    setLocalCompareSelection((current) => {
      if (current.player1Id === syncedPlayer1Id && current.player2Id === syncedPlayer2Id) {
        return current;
      }

      return {
        player1Id: syncedPlayer1Id,
        player2Id: syncedPlayer2Id,
      };
    });
  }, [syncedPlayer1Id, syncedPlayer2Id]);

  const selectedPlayer1Id = localCompareSelection.player1Id;
  const selectedPlayer2Id = localCompareSelection.player2Id;

  function updateCompareSelection(next: { player1Id: string; player2Id: string }) {
    setLocalCompareSelection(next);
    setCompareSelection("shot-type", next);
  }

  const compareData = buildShotTypePlayerComparisonFromRows(
    shotTypeRows,
    selectedPlayer1Id,
    selectedPlayer2Id,
  ).map((row) => {
    return {
      shotType: row.shotType.charAt(0).toUpperCase() + row.shotType.slice(1),
      delta: Number(row.delta.toFixed(1)),
    };
  });
  const highlightedPlayers = [selectedPlayer1Id, selectedPlayer2Id].filter(Boolean);

  return (
    <section className="dashboard-view">
      <PageHeader title="Shot Type" />
      {filterOptions ? (
        <FilterToolbar
          value={filters}
          pendingValue={pendingFilters}
          onPendingChange={setPendingFilters}
          onApply={applyFilters}
          onReset={resetFilters}
          dateRange
          shotType
          outcome
          contestLevel
          creation
          shotClock
          applyButton
          resetButton
          filterOptions={filterOptions}
        />
      ) : null}
      <ShotTypeStackedBarChart rows={shotTypeRows} highlightedPlayerIds={highlightedPlayers} />
      {filterOptions ? (
        <DivergingCompareChart
          player1={selectedPlayer1Id}
          player2={selectedPlayer2Id}
          playerOptions={comparePlayerOptions}
          data={compareData}
          axisLabel="Difference in shot frequency %"
          onPlayer1Change={(playerId) =>
            updateCompareSelection({
              player1Id: playerId,
              player2Id: selectedPlayer2Id,
            })
          }
          onPlayer2Change={(playerId) =>
            updateCompareSelection({
              player1Id: selectedPlayer1Id,
              player2Id: playerId,
            })
          }
        />
      ) : null}
    </section>
  );
}

function EfficiencyView() {
  const {
    filters,
    pendingFilters,
    efficiencyRows,
    compareSelections,
    filterOptions,
    setPendingFilters,
    applyFilters,
    resetFilters,
  } = useDashboardContext();

  return (
    <section className="dashboard-view">
      <PageHeader title="Efficiency" />
      {filterOptions ? (
        <FilterToolbar
          value={filters}
          pendingValue={pendingFilters}
          onPendingChange={setPendingFilters}
          onApply={applyFilters}
          onReset={resetFilters}
          dateRange
          shotType
          outcome
          contestLevel
          creation
          shotClock
          applyButton
          resetButton
          filterOptions={filterOptions}
        />
      ) : null}
      <div className="dashboard-card">
        <h2>Efficiency View</h2>
        <p>The active/pending filters remain shared when switching between views.</p>
        <p>Efficiency rows loaded: {efficiencyRows.length}</p>
        <p>
          Pending date range: {pendingFilters.dateFrom || "none"} to {pendingFilters.dateTo || "none"}
        </p>
        <p>Applied shot clock filter: {filters.shotClock?.join(", ") || "none"}</p>
        <p>
          Compare players: {compareSelections.efficiency.player1Id || "none"} vs{" "}
          {compareSelections.efficiency.player2Id || "none"}
        </p>
        <p>Available players: {filterOptions?.players.length ?? 0}</p>
        <p>
          Inspect loaded CSV rows in DevTools with <code>window.__shotDataDebug.shots</code>.
        </p>
      </div>
    </section>
  );
}

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
            <p>Shared filter state and top-card rows are being initialized.</p>
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
