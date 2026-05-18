/*
This view renders the efficiency dashboard screen, including its filters, heatmap table, and comparison chart.
It derives player comparison data from the shared efficiency rows already loaded in context.
*/
import { useDashboardContext } from "../../context/DashboardContext";
import { buildEfficiencyPlayerComparisonFromRows } from "../../data/transforms/shotAggregations";
import { DivergingCompareChart } from "../charts/DivergingCompareChart";
import { FilterToolbar } from "../filters/FilterToolbar";
import { PageHeader } from "../layout/PageHeader";
import { EfficiencyHeatmapTable } from "../tables/EfficiencyHeatmapTable";
import { useCompareSelection } from "./useCompareSelection";

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
  const {
    playerOptions: comparePlayerOptions,
    selectedPlayer1Id,
    selectedPlayer2Id,
    highlightedPlayerIds,
    updateCompareSelection,
  } = useCompareSelection(
    "efficiency",
    efficiencyRows,
    compareSelections.efficiency,
    setCompareSelection,
  );

  const compareData = buildEfficiencyPlayerComparisonFromRows(
    efficiencyRows,
    selectedPlayer1Id,
    selectedPlayer2Id,
  ).map((row) => ({
    shotType: row.shotType.charAt(0).toUpperCase() + row.shotType.slice(1),
    delta: Number(row.delta.toFixed(1)),
  }));

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
      <EfficiencyHeatmapTable rows={efficiencyRows} highlightedPlayerIds={highlightedPlayerIds} />
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
