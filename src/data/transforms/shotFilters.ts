import { FILTER_ALL } from "../models/shotDomain";
import type { ShotRecord } from "../models/shotSchemas";
import type { DashboardFilters } from "../api/shotAnalyticsApi";

export function applyFilters(shots: ShotRecord[], filters: DashboardFilters): ShotRecord[] {
  return shots.filter((shot) => {
    if (filters.dateFrom && shot.date < filters.dateFrom) return false;
    if (filters.dateTo && shot.date > filters.dateTo) return false;

    if (filters.shotType && filters.shotType !== FILTER_ALL && shot.shotType !== filters.shotType) {
      return false;
    }

    if (filters.outcome === "made" && !shot.made) return false;
    if (filters.outcome === "missed" && shot.made) return false;

    if (
      filters.contestLevel &&
      filters.contestLevel !== FILTER_ALL &&
      shot.contestLevel !== filters.contestLevel
    ) {
      return false;
    }

    if (
      filters.creation &&
      filters.creation !== FILTER_ALL &&
      shot.creationType !== filters.creation
    ) {
      return false;
    }

    if (filters.shotClock && filters.shotClock !== FILTER_ALL && shot.shotClockBucket !== filters.shotClock) {
      return false;
    }

    return true;
  });
}
