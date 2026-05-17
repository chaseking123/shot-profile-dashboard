import { FILTER_ALL } from "../models/shotDomain";
import type { ShotRecord } from "../models/shotSchemas";
import type { DashboardFilters } from "../api/shotAnalyticsApi";

function matchesMultiSelect(selectedValues: string[] | undefined, shotValue: string) {
  if (!selectedValues || selectedValues.length === 0 || selectedValues.includes(FILTER_ALL)) {
    return true;
  }

  return selectedValues.includes(shotValue);
}

export function applyFilters(shots: ShotRecord[], filters: DashboardFilters): ShotRecord[] {
  return shots.filter((shot) => {
    if (filters.dateFrom && shot.date < filters.dateFrom) return false;
    if (filters.dateTo && shot.date > filters.dateTo) return false;

    if (!matchesMultiSelect(filters.shotType, shot.shotType)) {
      return false;
    }

    if (!matchesMultiSelect(filters.outcome, shot.made ? "made" : "missed")) return false;

    if (!matchesMultiSelect(filters.contestLevel, shot.contestLevel)) {
      return false;
    }

    if (!matchesMultiSelect(filters.creation, shot.creationType)) {
      return false;
    }

    if (!matchesMultiSelect(filters.shotClock, shot.shotClockBucket)) {
      return false;
    }

    return true;
  });
}
