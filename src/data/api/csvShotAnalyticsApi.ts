/*
This file implements the shot analytics API by loading and caching the local CSV dataset in the browser.
It parses raw rows, applies filters, and returns the aggregated data needed by the dashboard views.
*/
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

export type ShotDataDiagnostics = {
  rawRowCount: number;
  normalizedRowCount: number;
  droppedRowCount: number;
  parseIssueCount: number;
  warningMessage: string | null;
};

type CachedShotData = {
  shots: ShotRecord[];
  diagnostics: ShotDataDiagnostics;
};

let cachedShotData: CachedShotData | null = null;

function buildWarningMessage(diagnostics: ShotDataDiagnostics): string | null {
  const warnings: string[] = [];

  if (diagnostics.parseIssueCount > 0) {
    warnings.push(
      `${diagnostics.parseIssueCount} CSV parse issue${diagnostics.parseIssueCount === 1 ? "" : "s"} detected`,
    );
  }

  if (diagnostics.droppedRowCount > 0) {
    warnings.push(
      `${diagnostics.droppedRowCount} invalid row${diagnostics.droppedRowCount === 1 ? "" : "s"} excluded`,
    );
  }

  if (warnings.length === 0) {
    return null;
  }

  return `${warnings.join(" and ")}. Dashboard results may be based on partial data.`;
}

async function loadShotData(): Promise<CachedShotData> {
  if (cachedShotData) return cachedShotData;

  const response = await fetch("/data/shots.csv");

  if (!response.ok) {
    throw new Error(`Failed to fetch shot data (${response.status} ${response.statusText}).`);
  }

  const csvText = await response.text();

  const parsed = Papa.parse<RawShotCsvRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  if (parsed.errors.length > 0) {
    console.warn("CSV parse warnings/errors:", parsed.errors);
  }

  const normalizedShots = parsed.data
    .map(normalizeShotRow)
    .filter((shot): shot is ShotRecord => shot !== null);
  const diagnostics: ShotDataDiagnostics = {
    rawRowCount: parsed.data.length,
    normalizedRowCount: normalizedShots.length,
    droppedRowCount: parsed.data.length - normalizedShots.length,
    parseIssueCount: parsed.errors.length,
    warningMessage: null,
  };

  diagnostics.warningMessage = buildWarningMessage(diagnostics);

  if (diagnostics.warningMessage) {
    console.warn(diagnostics.warningMessage);
  }

  if (normalizedShots.length === 0) {
    throw new Error("Shot data loaded, but no valid rows were available after validation.");
  }

  cachedShotData = {
    shots: normalizedShots,
    diagnostics,
  };

  return cachedShotData;
}

export async function preloadShotData(): Promise<ShotRecord[]> {
  const { shots } = await loadShotData();
  return shots;
}

export function getShotDataDiagnostics(): ShotDataDiagnostics | null {
  return cachedShotData?.diagnostics ?? null;
}

export function clearShotDataCache() {
  cachedShotData = null;
}

export const csvShotAnalyticsApi: ShotAnalyticsApi = {
  async getFilterOptions() {
    const { shots } = await loadShotData();
    return buildFilterOptions(shots);
  },

  async getShotTypeByPlayer(filters) {
    const { shots: allShots } = await loadShotData();
    const shots = applyFilters(allShots, filters);
    return {
      rows: buildShotTypeByPlayer(shots),
    };
  },

  async getEfficiencyByShotType(filters) {
    const { shots: allShots } = await loadShotData();
    const shots = applyFilters(allShots, filters);
    return {
      rows: buildEfficiencyByShotType(shots),
    };
  },
};
