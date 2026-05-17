import type { DashboardFilters } from "../data/api/shotAnalyticsApi";
import {
  CONTEST_LEVELS,
  CREATION_TYPES,
  FILTER_OUTCOMES,
  SHOT_CLOCK_BUCKETS,
  SHOT_TYPES,
} from "../data/models/shotDomain";

export type DashboardView = "shot-type" | "efficiency";

export const DEFAULT_FILTERS: DashboardFilters = {
  dateFrom: "",
  dateTo: "",
  shotType: [...SHOT_TYPES],
  outcome: FILTER_OUTCOMES.filter((value) => value !== "all"),
  contestLevel: [...CONTEST_LEVELS],
  creation: [...CREATION_TYPES],
  shotClock: [...SHOT_CLOCK_BUCKETS],
};
