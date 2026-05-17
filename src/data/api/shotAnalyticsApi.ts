import type {
  ContestLevel,
  CreationType,
  FilterOutcome,
  FilterableShotClockBucket,
  FilterableShotType,
  ShotType,
} from "../models/shotDomain";
import { FILTER_ALL } from "../models/shotDomain";
import type {
  NullableShotTypeMetricMap,
  NumericShotTypeMetricMap,
} from "../models/shotSchemas";

export type MultiSelectFilterValue<TValue extends string> = TValue[];

export type DashboardFilters = {
  dateFrom?: string;
  dateTo?: string;
  shotType?: MultiSelectFilterValue<FilterableShotType>;
  outcome?: MultiSelectFilterValue<FilterOutcome>;
  contestLevel?: MultiSelectFilterValue<ContestLevel | typeof FILTER_ALL>;
  creation?: MultiSelectFilterValue<CreationType | typeof FILTER_ALL>;
  shotClock?: MultiSelectFilterValue<FilterableShotClockBucket>;
};

export type FilterOptionsResponse = {
  dates: string[];
  minDate: string | null;
  maxDate: string | null;
  shotTypes: FilterableShotType[];
  outcomes: FilterOutcome[];
  contestLevels: Array<ContestLevel | "all">;
  creations: Array<CreationType | "all">;
  shotClockBuckets: FilterableShotClockBucket[];
  players: {
    shooterId: string;
    shooterName: string;
  }[];
};

export type ShotTypeDistributionRow = {
  shooterId: string;
  shooterName: string;
  fga: number;
  isTeamAverage?: boolean;
} & NumericShotTypeMetricMap;

export type ComparePlayersRow = {
  shotType: ShotType;
  player1Pct: number;
  player2Pct: number;
  delta: number;
};

export type EfficiencyByShotTypeRow = {
  shooterId: string;
  shooterName: string;
  isTeamAverage?: boolean;
} & NullableShotTypeMetricMap;

export type ShotAnalyticsApi = {
  getFilterOptions(): Promise<FilterOptionsResponse>;
  getShotTypeByPlayer(filters: DashboardFilters): Promise<{
    rows: ShotTypeDistributionRow[];
  }>;
  getEfficiencyByShotType(filters: DashboardFilters): Promise<{
    rows: EfficiencyByShotTypeRow[];
  }>;
};
