import {
  CREATION_TYPES,
  FILTERABLE_CONTEST_LEVELS,
  FILTERABLE_CREATION_TYPES,
  FILTERABLE_SHOT_CLOCK_BUCKETS,
  FILTERABLE_SHOT_TYPES,
  FILTER_OUTCOMES,
  SHOT_CLOCK_BUCKETS,
  type ContestLevel,
  type CreationType,
  type FilterOutcome,
  type FilterableContestLevel,
  type FilterableCreationType,
  type FilterableShotClockBucket,
  type FilterableShotType,
  type ShotClockBucket,
} from "../models/shotDomain";

export type FilterOption<TValue extends string> = {
  value: TValue;
  label: string;
};

const FILTER_LABELS: Record<string, string> = {
  all: "All",
  made: "Made",
  missed: "Missed",
  uncontested: "Uncontested",
  lightly_contested: "Lightly Contested",
  heavily_contested: "Heavily Contested",
  unknown: "Unknown",
  catch_and_shoot: "Catch & Shoot",
  off_dribble: "Off Dribble",
  assisted: "Assisted",
  self_created: "Self Created",
  early: "Early Clock",
  middle: "Middle Clock",
  late: "Late Clock",
  very_late: "Very Late Clock",
  layup: "Layup",
  post: "Post",
  floater: "Floater",
  jumper: "Jumper",
  heave: "Heave",
};

function labelFor(value: string) {
  return FILTER_LABELS[value] ?? value;
}

function toOptions<TValue extends string>(
  values: readonly TValue[],
  overrides: Partial<Record<TValue, string>> = {},
): FilterOption<TValue>[] {
  return values.map((value) => ({
    value,
    label: overrides[value] ?? labelFor(value),
  }));
}

export const outcomeFilterOptions: FilterOption<FilterOutcome>[] = toOptions(FILTER_OUTCOMES, {
  all: "All Outcomes",
});

export const shotTypeFilterOptions: FilterOption<FilterableShotType>[] = toOptions(
  FILTERABLE_SHOT_TYPES,
  {
    all: "All Shot Types",
  },
);

export const contestLevelFilterOptions: FilterOption<FilterableContestLevel>[] = toOptions(
  FILTERABLE_CONTEST_LEVELS,
  {
    all: "All Contest Levels",
  },
);

export const creationFilterOptions: FilterOption<FilterableCreationType>[] = toOptions(
  FILTERABLE_CREATION_TYPES,
  {
    all: "All Creations",
  },
);

export const shotClockFilterOptions: FilterOption<FilterableShotClockBucket>[] = toOptions(
  FILTERABLE_SHOT_CLOCK_BUCKETS,
  {
    all: "All Clocks",
  },
);

export function getShotTypeLabel(value: FilterableShotType) {
  return labelFor(value);
}

export function getContestLevelLabel(value: ContestLevel | FilterableContestLevel) {
  return labelFor(value);
}

export function getCreationTypeLabel(value: CreationType | FilterableCreationType) {
  return labelFor(value);
}

export function getShotClockBucketLabel(value: ShotClockBucket | FilterableShotClockBucket) {
  return labelFor(value);
}

export function getOutcomeLabel(value: FilterOutcome) {
  return labelFor(value);
}

export const availableCreationTypes = CREATION_TYPES;
export const availableShotClockBuckets = SHOT_CLOCK_BUCKETS;
