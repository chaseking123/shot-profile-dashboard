import "./ShotTypeStackedBarChart.css";

import { useMemo, useState } from "react";

import { getShotTypeLabel } from "../../data/constants/filterConfig";
import type { ShotTypeDistributionRow } from "../../data/api/shotAnalyticsApi";
import { SHOT_TYPES } from "../../data/models/shotDomain";

type ShotTypeStackedBarChartProps = {
  title?: string;
  rows: ShotTypeDistributionRow[];
  highlightedPlayerIds?: string[];
};

const SHOT_TYPE_COLORS: Record<(typeof SHOT_TYPES)[number], string> = {
  layup: "#1d4ed8",
  post: "#0f766e",
  floater: "#d97706",
  jumper: "#7c3aed",
  heave: "#dc2626",
};

function shouldShowLabel(width: number) {
  return width >= 12;
}

type SortDirection = "none" | "asc" | "desc";

function getNextSortDirection(
  currentShotType: (typeof SHOT_TYPES)[number] | null,
  currentDirection: SortDirection,
  nextShotType: (typeof SHOT_TYPES)[number],
): SortDirection {
  if (currentShotType !== nextShotType) return "desc";
  if (currentDirection === "desc") return "asc";
  if (currentDirection === "asc") return "none";
  return "desc";
}

export function ShotTypeStackedBarChart({
  title = "Shot Type by Player",
  rows,
  highlightedPlayerIds = [],
}: ShotTypeStackedBarChartProps) {
  const [sortState, setSortState] = useState<{
    shotType: (typeof SHOT_TYPES)[number] | null;
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

    const sortShotType = sortState.shotType;
    const factor = sortState.direction === "asc" ? 1 : -1;

    return [...playerRows].sort((rowA, rowB) => {
      const difference = rowA[sortShotType] - rowB[sortShotType];

      if (difference !== 0) {
        return difference * factor;
      }

      return rowA.shooterName.localeCompare(rowB.shooterName);
    });
  }, [playerRows, sortState]);

  return (
    <section className="dashboard-card shot-type-card">
      <div className="dashboard-card__header">
        <h2>{title}</h2>
      </div>

      <div className="shot-type-card__legend" aria-label="Shot type legend">
        {SHOT_TYPES.map((shotType) => (
          <button
            type="button"
            className={[
              "shot-type-card__legend-item",
              sortState.shotType === shotType && sortState.direction !== "none"
                ? "shot-type-card__legend-item--active"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            key={shotType}
            onClick={() =>
              setSortState((current) => ({
                shotType,
                direction: getNextSortDirection(current.shotType, current.direction, shotType),
              }))
            }
          >
            <span
              className="shot-type-card__legend-swatch"
              style={{ backgroundColor: SHOT_TYPE_COLORS[shotType] }}
            />
            {getShotTypeLabel(shotType)}
            <span className="shot-type-card__legend-indicator" aria-hidden="true">
              {sortState.shotType === shotType
                ? sortState.direction === "desc"
                  ? "↓"
                  : sortState.direction === "asc"
                    ? "↑"
                    : ""
                : ""}
            </span>
          </button>
        ))}
      </div>

      <div className="shot-type-card__table">
        <div className="shot-type-card__header">
          <span>Player</span>
          <span>Shot Mix</span>
          <span>FGA</span>
        </div>

        <div className="shot-type-card__scroll">
          {sortedPlayerRows.map((row) => {
            const isHighlighted = highlightedPlayerIds.includes(row.shooterId);

            return (
              <div
                className={[
                  "shot-type-card__row",
                  isHighlighted ? "shot-type-card__row--highlighted" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={row.shooterId}
              >
                <div className="shot-type-card__player">{row.shooterName}</div>

                <div className="shot-type-card__bar" aria-label={`${row.shooterName} shot distribution`}>
                  {SHOT_TYPES.map((shotType) => {
                    const value = row[shotType];

                    return (
                      <div
                        className="shot-type-card__segment"
                        key={shotType}
                        title={`${getShotTypeLabel(shotType)}: ${value}%`}
                        style={{
                          width: `${value}%`,
                          backgroundColor: SHOT_TYPE_COLORS[shotType],
                        }}
                      >
                        {shouldShowLabel(value) ? (
                          <span className="shot-type-card__segment-label">{value}%</span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <div className="shot-type-card__fga">{row.fga}</div>
              </div>
            );
          })}
        </div>

        {teamAverageRow ? (
          <div className="shot-type-card__sticky">
            <div
              className={[
                "shot-type-card__row",
                highlightedPlayerIds.includes(teamAverageRow.shooterId) ? "shot-type-card__row--highlighted" : "",
                "shot-type-card__row--team-average",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="shot-type-card__player">{teamAverageRow.shooterName}</div>

              <div className="shot-type-card__bar" aria-label={`${teamAverageRow.shooterName} shot distribution`}>
                {SHOT_TYPES.map((shotType) => {
                  const value = teamAverageRow[shotType];

                  return (
                    <div
                      className="shot-type-card__segment"
                      key={shotType}
                      title={`${getShotTypeLabel(shotType)}: ${value}%`}
                      style={{
                        width: `${value}%`,
                        backgroundColor: SHOT_TYPE_COLORS[shotType],
                      }}
                    >
                      {shouldShowLabel(value) ? (
                        <span className="shot-type-card__segment-label">{value}%</span>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="shot-type-card__fga">{teamAverageRow.fga}</div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
