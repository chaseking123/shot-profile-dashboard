import Papa from "papaparse";

import type { ShotAnalyticsApi } from "./shotAnalyticsApi";
import type { RawShotCsvRow, ShotRecord } from "../models/shotSchemas";
import { normalizeShotRow } from "../transforms/shotTransforms";
import { applyFilters } from "../transforms/shotFilters";
import {
  buildEfficiencyByShotType,
  buildFilterOptions,
  buildShotTypeByPlayer,
} from "../transforms/shotAggregations";

let cachedShots: ShotRecord[] | null = null;

async function loadShots(): Promise<ShotRecord[]> {
  if (cachedShots) return cachedShots;

  const response = await fetch("/data/shots.csv");
  const csvText = await response.text();

  const parsed = Papa.parse<RawShotCsvRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  if (parsed.errors.length > 0) {
    console.warn("CSV parse warnings/errors:", parsed.errors);
  }

  cachedShots = parsed.data
    .map(normalizeShotRow)
    .filter((shot): shot is ShotRecord => shot !== null);

  return cachedShots;
}

export async function preloadShotData(): Promise<ShotRecord[]> {
  return loadShots();
}

export function getCachedShotsForDebug(): ShotRecord[] | null {
  return cachedShots;
}

export const csvShotAnalyticsApi: ShotAnalyticsApi = {
  async getFilterOptions() {
    const shots = await loadShots();
    return buildFilterOptions(shots);
  },

  async getShotTypeByPlayer(filters) {
    const shots = applyFilters(await loadShots(), filters);
    return {
      rows: buildShotTypeByPlayer(shots),
    };
  },

  async getEfficiencyByShotType(filters) {
    const shots = applyFilters(await loadShots(), filters);
    return {
      rows: buildEfficiencyByShotType(shots),
    };
  },
};
