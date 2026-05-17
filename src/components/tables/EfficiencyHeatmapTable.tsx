import "./EfficiencyHeatmapTable.css";

import { useMemo, useState } from "react";

import type { EfficiencyByShotTypeRow } from "../../data/api/shotAnalyticsApi";
import { getShotTypeLabel } from "../../data/constants/filterConfig";
import { SHOT_TYPES, type ShotType } from "../../data/models/shotDomain";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table";

type EfficiencyHeatmapTableProps = {
  title?: string;
  rows: EfficiencyByShotTypeRow[];
  highlightedPlayerIds?: string[];
};

type SortDirection = "none" | "asc" | "desc";

function formatFgPct(value: number | null) {
  return value === null ? "-" : `${value.toFixed(1)}%`;
}

function getNextSortDirection(
  currentShotType: ShotType | null,
  currentDirection: SortDirection,
  nextShotType: ShotType,
): SortDirection {
  if (currentShotType !== nextShotType) return "desc";
  if (currentDirection === "desc") return "asc";
  if (currentDirection === "asc") return "none";
  return "desc";
}

function getDeltaColorClass(value: number | null, teamAverage: number | null) {
  if (value === null || teamAverage === null) return "efficiency-table__metric-cell--neutral";

  const delta = value - teamAverage;

  if (delta >= 4) return "efficiency-table__metric-cell--positive-strong";
  if (delta >= 2) return "efficiency-table__metric-cell--positive-soft";
  if (delta <= -4) return "efficiency-table__metric-cell--negative-strong";
  if (delta <= -2) return "efficiency-table__metric-cell--negative-soft";
  return "efficiency-table__metric-cell--balanced";
}

function renderMetricCell(
  row: EfficiencyByShotTypeRow,
  shotType: ShotType,
  teamAverageRow: EfficiencyByShotTypeRow | undefined,
) {
  const value = row[shotType];
  const teamAverageValue = teamAverageRow?.[shotType] ?? null;
  const colorClass = row.isTeamAverage
    ? "efficiency-table__metric-cell--neutral"
    : getDeltaColorClass(value, teamAverageValue);

  return (
    <TableCell
      key={shotType}
      className={`efficiency-table__metric-cell ${colorClass}`}
      aria-label={`${row.shooterName} ${getShotTypeLabel(shotType)} FG%`}
    >
      <span className={value === null ? "efficiency-table__dash" : "efficiency-table__value"}>
        {formatFgPct(value)}
      </span>
    </TableCell>
  );
}

export function EfficiencyHeatmapTable({
  title = "Efficiency by Shot Type",
  rows,
  highlightedPlayerIds = [],
}: EfficiencyHeatmapTableProps) {
  const [sortState, setSortState] = useState<{
    shotType: ShotType | null;
    direction: SortDirection;
  }>({
    shotType: null,
    direction: "none",
  });
  const playerRows = rows.filter((row) => !row.isTeamAverage);
  const teamAverageRow = rows.find((row) => row.isTeamAverage);
  const sortedPlayerRows = useMemo(() => {
    if (!sortState.shotType || sortState.direction === "none") {
      return playerRows;
    }

    const shotType = sortState.shotType;
    const factor = sortState.direction === "asc" ? 1 : -1;

    return [...playerRows].sort((rowA, rowB) => {
      const valueA = rowA[shotType];
      const valueB = rowB[shotType];

      if (valueA === null && valueB === null) {
        return rowA.shooterName.localeCompare(rowB.shooterName);
      }

      if (valueA === null) return 1;
      if (valueB === null) return -1;

      const difference = valueA - valueB;

      if (difference !== 0) {
        return difference * factor;
      }

      return rowA.shooterName.localeCompare(rowB.shooterName);
    });
  }, [playerRows, sortState]);

  return (
    <section className="dashboard-card efficiency-table-card">
      <div className="dashboard-card__header">
        <h2>{title}</h2>
      </div>

      <div className="efficiency-table-card__table-wrap">
        <Table className="efficiency-table">
          <TableHeader>
            <TableRow role="rowheader">
              <TableHead className="efficiency-table__player-head">Player</TableHead>
              {SHOT_TYPES.map((shotType) => (
                <TableHead key={shotType} className="efficiency-table__metric-head">
                  <button
                    type="button"
                    className={[
                      "efficiency-table__sort-button",
                      sortState.shotType === shotType && sortState.direction !== "none"
                        ? "efficiency-table__sort-button--active"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() =>
                      setSortState((current) => ({
                        shotType,
                        direction: getNextSortDirection(current.shotType, current.direction, shotType),
                      }))
                    }
                  >
                    <span>{getShotTypeLabel(shotType)} FG%</span>
                    <span className="efficiency-table__sort-indicator" aria-hidden="true">
                      {sortState.shotType === shotType
                        ? sortState.direction === "desc"
                          ? "↓"
                          : sortState.direction === "asc"
                            ? "↑"
                            : ""
                        : ""}
                    </span>
                  </button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        </Table>

        <div className="efficiency-table-card__scroll">
          <Table className="efficiency-table">
            <TableBody>
              {sortedPlayerRows.map((row) => {
                const isHighlighted = highlightedPlayerIds.includes(row.shooterId);

                return (
                  <TableRow
                    key={row.shooterId}
                    className={isHighlighted ? "efficiency-table__row--highlighted" : ""}
                  >
                    <TableCell className="efficiency-table__player-cell">{row.shooterName}</TableCell>
                    {SHOT_TYPES.map((shotType) => renderMetricCell(row, shotType, teamAverageRow))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {teamAverageRow ? (
          <div className="efficiency-table-card__sticky">
            <Table className="efficiency-table">
              <TableBody>
                <TableRow
                  className={[
                    "efficiency-table__row--team-average",
                    highlightedPlayerIds.includes(teamAverageRow.shooterId)
                      ? "efficiency-table__row--highlighted"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <TableCell className="efficiency-table__player-cell">
                    {teamAverageRow.shooterName}
                  </TableCell>
                  {SHOT_TYPES.map((shotType) =>
                    renderMetricCell(teamAverageRow, shotType, teamAverageRow),
                  )}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ) : null}
      </div>
    </section>
  );
}
