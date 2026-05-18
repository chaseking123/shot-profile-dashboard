/*
This file turns filtered shot records into the aggregated rows and option metadata consumed by the UI.
It contains the shared grouping, percentage, and comparison helpers for both dashboard views.
*/
import {
  FILTERABLE_CONTEST_LEVELS,
  FILTERABLE_CREATION_TYPES,
  FILTERABLE_SHOT_CLOCK_BUCKETS,
  FILTERABLE_SHOT_TYPES,
  FILTER_OUTCOMES,
  SHOT_TYPES,
  type ShotType,
} from "../models/shotDomain";
import type { ShotRecord } from "../models/shotSchemas";
import type {
  ComparePlayersRow,
  EfficiencyByShotTypeRow,
  FilterOptionsResponse,
  ShotTypeDistributionRow,
} from "../api/shotAnalyticsApi";

function createShotTypeMetricMap<TValue>(factory: (shotType: ShotType) => TValue): Record<ShotType, TValue> {
  return Object.fromEntries(SHOT_TYPES.map((shotType) => [shotType, factory(shotType)])) as Record<
    ShotType,
    TValue
  >;
}

function groupBy<TItem, TKey extends string>(items: TItem[], getKey: (item: TItem) => TKey) {
  return items.reduce<Record<TKey, TItem[]>>((acc, item) => {
    const key = getKey(item);
    acc[key] ??= [];
    acc[key].push(item);
    return acc;
  }, {} as Record<TKey, TItem[]>);
}

// Rounding helper to round to 1 decimal place for cleaner percentage displays in the UI
function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function percentage(numerator: number, denominator: number): number {
  if (!denominator) return 0;
  return round1((numerator / denominator) * 100);
}

function countShotType(shots: ShotRecord[], shotType: ShotType) {
  return shots.filter((shot) => shot.shotType === shotType).length;
}

export function calculateFgPct(shots: ShotRecord[]): number | null {
  if (shots.length === 0) return null;
  const fgm = shots.filter((shot) => shot.made).length;
  return round1((fgm / shots.length) * 100);
}

// The functions below build the specific aggregated row shapes and filter option metadata expected by the UI from the normalized shot records.
export function buildFilterOptions(shots: ShotRecord[]): FilterOptionsResponse {
  const dates = [...new Set(shots.map((shot) => shot.date))].sort();
  const players = [...new Map(shots.map((shot) => [shot.shooterId, {
    shooterId: shot.shooterId,
    shooterName: shot.shooterName,
  }])).values()].sort((a, b) => a.shooterName.localeCompare(b.shooterName));

  return {
    dates,
    minDate: dates[0] ?? null,
    maxDate: dates.at(-1) ?? null,
    shotTypes: [...FILTERABLE_SHOT_TYPES],
    outcomes: [...FILTER_OUTCOMES],
    contestLevels: [...FILTERABLE_CONTEST_LEVELS],
    creations: [...FILTERABLE_CREATION_TYPES],
    shotClockBuckets: [...FILTERABLE_SHOT_CLOCK_BUCKETS],
    players,
  };
}

export function buildShotTypeByPlayer(shots: ShotRecord[]): ShotTypeDistributionRow[] {
  const byPlayer = groupBy(shots, (shot) => shot.shooterId);

  const rows = Object.entries(byPlayer).map(([shooterId, playerShots]) => {
    const total = playerShots.length;

    return {
      shooterId,
      shooterName: playerShots[0].shooterName,
      ...createShotTypeMetricMap((shotType) => percentage(countShotType(playerShots, shotType), total)),
      fga: total,
    };
  });

  rows.sort((a, b) => a.shooterName.localeCompare(b.shooterName));
  return [...rows, buildTeamAverageDistributionRow(shots)];
}

export function buildTeamAverageDistributionRow(shots: ShotRecord[]): ShotTypeDistributionRow {
  const total = shots.length;

  return {
    shooterId: "team-average",
    shooterName: "Team Average",
    ...createShotTypeMetricMap((shotType) => percentage(countShotType(shots, shotType), total)),
    fga: total,
    isTeamAverage: true,
  };
}

export function buildShotTypePlayerComparisonFromRows(
  rows: ShotTypeDistributionRow[],
  player1Id: string,
  player2Id: string,
): ComparePlayersRow[] {
  const player1 = rows.find((row) => row.shooterId === player1Id);
  const player2 = rows.find((row) => row.shooterId === player2Id);

  if (!player1 || !player2) return [];

  return SHOT_TYPES.map((shotType) => {
    const player1Pct = player1[shotType];
    const player2Pct = player2[shotType];

    return {
      shotType,
      player1Pct,
      player2Pct,
      delta: round1(player2Pct - player1Pct),
    };
  });
}

export function buildEfficiencyByShotType(shots: ShotRecord[]): EfficiencyByShotTypeRow[] {
  const byPlayer = groupBy(shots, (shot) => shot.shooterId);

  const rows = Object.entries(byPlayer).map(([shooterId, playerShots]) => ({
    shooterId,
    shooterName: playerShots[0].shooterName,
    ...createShotTypeMetricMap((shotType) =>
      calculateFgPct(playerShots.filter((shot) => shot.shotType === shotType)),
    ),
  }));

  rows.sort((a, b) => a.shooterName.localeCompare(b.shooterName));
  return [...rows, buildTeamAverageEfficiencyRow(shots)];
}

export function buildEfficiencyPlayerComparisonFromRows(
  rows: EfficiencyByShotTypeRow[],
  player1Id: string,
  player2Id: string,
): ComparePlayersRow[] {
  const player1 = rows.find((row) => row.shooterId === player1Id);
  const player2 = rows.find((row) => row.shooterId === player2Id);

  if (!player1 || !player2) return [];

  return SHOT_TYPES.map((shotType) => {
    const player1Pct = player1[shotType] ?? 0;
    const player2Pct = player2[shotType] ?? 0;

    return {
      shotType,
      player1Pct,
      player2Pct,
      delta: round1(player2Pct - player1Pct),
    };
  });
}

export function buildTeamAverageEfficiencyRow(shots: ShotRecord[]): EfficiencyByShotTypeRow {
  return {
    shooterId: "team-average",
    shooterName: "Team Average",
    ...createShotTypeMetricMap((shotType) =>
      calculateFgPct(shots.filter((shot) => shot.shotType === shotType)),
    ),
    isTeamAverage: true,
  };
}
