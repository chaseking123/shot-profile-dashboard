export const FILTER_ALL = "all" as const;

export const SHOT_TYPES = ["layup", "post", "floater", "jumper", "heave"] as const;
export type ShotType = (typeof SHOT_TYPES)[number];

export const COMPLEX_SHOT_TYPES = [
  "heave",
  "catchAndShoot",
  "catchAndShootRelocating",
  "catchAndShootOnMoveLeft",
  "catchAndShootOnMoveRight",
  "pullupJumper",
  "stepback",
  "shakeAndRaise",
  "overScreen",
  "drivingFloater",
  "cutFloater",
  "postLeft",
  "postRight",
  "drivingLayup",
  "cutLayup",
  "standstillLayup",
  "lob",
  "tip",
] as const;
export type ComplexShotType = (typeof COMPLEX_SHOT_TYPES)[number];

export const CONTEST_LEVELS = [
  "uncontested",
  "lightly_contested",
  "heavily_contested",
] as const;
export type ContestLevel = (typeof CONTEST_LEVELS)[number];

export const CREATION_TYPES = [
  "catch_and_shoot",
  "off_dribble",
] as const;
export type CreationType = (typeof CREATION_TYPES)[number];

export const SHOT_CLOCK_BUCKETS = [
  "early",
  "middle",
  "late",
  "very_late",
] as const;
export type ShotClockBucket = (typeof SHOT_CLOCK_BUCKETS)[number];

export const FILTER_OUTCOMES = [FILTER_ALL, "made", "missed"] as const;
export type FilterOutcome = (typeof FILTER_OUTCOMES)[number];

export const FILTERABLE_CONTEST_LEVELS = [FILTER_ALL, ...CONTEST_LEVELS] as const;
export type FilterableContestLevel = (typeof FILTERABLE_CONTEST_LEVELS)[number];

export const FILTERABLE_CREATION_TYPES = [FILTER_ALL, ...CREATION_TYPES] as const;
export type FilterableCreationType = (typeof FILTERABLE_CREATION_TYPES)[number];

export const FILTERABLE_SHOT_CLOCK_BUCKETS = [FILTER_ALL, ...SHOT_CLOCK_BUCKETS] as const;
export type FilterableShotClockBucket = (typeof FILTERABLE_SHOT_CLOCK_BUCKETS)[number];

export const FILTERABLE_SHOT_TYPES = [FILTER_ALL, ...SHOT_TYPES] as const;
export type FilterableShotType = (typeof FILTERABLE_SHOT_TYPES)[number];
