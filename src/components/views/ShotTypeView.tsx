/*
This view renders the shot-type dashboard screen, including its filters, stacked distribution table, and comparison chart.
It derives compare data from the shared shot-type rows already loaded in context.
*/
import { useDashboardContext } from "../../context/DashboardContext";
import { buildShotTypePlayerComparisonFromRows } from "../../data/transforms/shotAggregations";
import { DivergingCompareChart } from "../charts/DivergingCompareChart";
import { ShotTypeStackedBarChart } from "../charts/ShotTypeStackedBarChart";
import { FilterToolbar } from "../filters/FilterToolbar";
import { PageHeader } from "../layout/PageHeader";
import { useCompareSelection } from "./useCompareSelection";

export function ShotTypeView() {
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
  const {
    playerOptions: comparePlayerOptions,
    selectedPlayer1Id,
    selectedPlayer2Id,
    highlightedPlayerIds,
    updateCompareSelection,
  } = useCompareSelection(
    "shot-type",
    shotTypeRows,
    compareSelections.shotType,
    setCompareSelection,
  );

  const compareData = buildShotTypePlayerComparisonFromRows(
    shotTypeRows,
    selectedPlayer1Id,
    selectedPlayer2Id,
  ).map((row) => ({
    shotType: row.shotType.charAt(0).toUpperCase() + row.shotType.slice(1),
    delta: Number(row.delta.toFixed(1)),
  }));

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
      <ShotTypeStackedBarChart rows={shotTypeRows} highlightedPlayerIds={highlightedPlayerIds} />
      {comparePlayerOptions.length > 0 ? (
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
