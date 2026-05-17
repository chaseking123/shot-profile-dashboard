import { useEffect, useMemo, useState } from "react";

import { useDashboardContext } from "../../context/DashboardContext";
import { buildEfficiencyPlayerComparisonFromRows } from "../../data/transforms/shotAggregations";
import { DivergingCompareChart } from "../charts/DivergingCompareChart";
import { FilterToolbar } from "../filters/FilterToolbar";
import { PageHeader } from "../layout/PageHeader";
import { EfficiencyHeatmapTable } from "../tables/EfficiencyHeatmapTable";

export function EfficiencyView() {
  const {
    filters,
    pendingFilters,
    efficiencyRows,
    compareSelections,
    filterOptions,
    setCompareSelection,
    setPendingFilters,
    applyFilters,
    resetFilters,
  } = useDashboardContext();
  const comparePlayerOptions = useMemo(
    () =>
      efficiencyRows
        .filter((row) => !row.isTeamAverage)
        .map((row) => ({
          shooterId: row.shooterId,
          shooterName: row.shooterName,
        })),
    [efficiencyRows],
  );
  const availablePlayerIds = new Set(comparePlayerOptions.map((player) => player.shooterId));
  const fallbackPlayer1Id = comparePlayerOptions[0]?.shooterId ?? "";
  const fallbackPlayer2Id = comparePlayerOptions[1]?.shooterId ?? fallbackPlayer1Id;
  const syncedPlayer1Id = availablePlayerIds.has(compareSelections.efficiency.player1Id)
    ? compareSelections.efficiency.player1Id
    : fallbackPlayer1Id;
  const syncedPlayer2Id = availablePlayerIds.has(compareSelections.efficiency.player2Id)
    ? compareSelections.efficiency.player2Id
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
    setCompareSelection("efficiency", next);
  }

  const compareData = buildEfficiencyPlayerComparisonFromRows(
    efficiencyRows,
    selectedPlayer1Id,
    selectedPlayer2Id,
  ).map((row) => ({
    shotType: row.shotType.charAt(0).toUpperCase() + row.shotType.slice(1),
    delta: Number(row.delta.toFixed(1)),
  }));
  const highlightedPlayers = [selectedPlayer1Id, selectedPlayer2Id].filter(Boolean);

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
          contestLevel
          creation
          shotClock
          applyButton
          resetButton
          filterOptions={filterOptions}
        />
      ) : null}
      <EfficiencyHeatmapTable rows={efficiencyRows} highlightedPlayerIds={highlightedPlayers} />
      {comparePlayerOptions.length > 0 ? (
        <DivergingCompareChart
          player1={selectedPlayer1Id}
          player2={selectedPlayer2Id}
          playerOptions={comparePlayerOptions}
          data={compareData}
          axisLabel="Difference in FG%"
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
