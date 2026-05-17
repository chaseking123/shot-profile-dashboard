import {
  COMPLEX_SHOT_TYPES,
  CONTEST_LEVELS,
  SHOT_TYPES,
  type ComplexShotType,
  type ContestLevel,
  type CreationType,
  type ShotClockBucket,
  type ShotType,
} from "../models/shotDomain";
import {
  complexShotTypeSchema,
  contestLevelSchema,
  rawShotCsvRowSchema,
  shotRecordSchema,
  shotTypeSchema,
  type RawShotCsvRow,
  type ShotRecord,
} from "../models/shotSchemas";

function isKnownEnumValue<TValue extends string>(
  values: readonly TValue[],
  value: string,
): value is TValue {
  return values.includes(value as TValue);
}

export function parseBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;

  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  return normalized === "true" || normalized === "1" || normalized === "yes";
}

export function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function buildDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getShotClockBucket(shotClock: number | null): ShotClockBucket {
  if (shotClock === null) return "middle";
  if (shotClock <= 4) return "very_late";
  if (shotClock <= 7) return "late";
  if (shotClock <= 15) return "middle";
  return "early";
}

export function getCreationType(shot: {
  catchAndShoot: boolean;
}): CreationType {
  if (shot.catchAndShoot) return "catch_and_shoot";
  return "off_dribble";
}

function parseShotType(value: unknown): ShotType | null {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!isKnownEnumValue(SHOT_TYPES, normalized)) return null;
  return shotTypeSchema.parse(normalized);
}

function parseComplexShotType(value: unknown): ComplexShotType | null {
  const normalized = String(value ?? "").trim();
  if (!isKnownEnumValue(COMPLEX_SHOT_TYPES, normalized)) return null;
  return complexShotTypeSchema.parse(normalized);
}

function parseContestLevel(value: unknown): ContestLevel {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!isKnownEnumValue(CONTEST_LEVELS, normalized)) return "lightly_contested";
  return contestLevelSchema.parse(normalized);
}

export function normalizeShotRow(row: RawShotCsvRow): ShotRecord | null {
  const parsedRow = rawShotCsvRowSchema.safeParse(row);
  if (!parsedRow.success) return null;

  const year = parseNumber(parsedRow.data.year);
  const month = parseNumber(parsedRow.data.month);
  const day = parseNumber(parsedRow.data.day);
  const period = parseNumber(parsedRow.data.period);
  const shotType = parseShotType(parsedRow.data.shot_type);
  const complexShotType = parseComplexShotType(parsedRow.data.complex_shot_type);

  if (
    year === null ||
    month === null ||
    day === null ||
    period === null ||
    shotType === null ||
    complexShotType === null ||
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    !Number.isInteger(period)
  ) {
    return null;
  }

  const contested = parseBoolean(parsedRow.data.contested);
  const contestLevel = contested ? parseContestLevel(parsedRow.data.contest_level) : "uncontested";
  const catchAndShoot = parseBoolean(parsedRow.data.catch_and_shoot);
  const assisted = parseBoolean(parsedRow.data.assisted);
  const dribblesBefore = parseNumber(parsedRow.data.dribbles_before);

  const normalized: ShotRecord = {
    shooterId: String(parsedRow.data.shooter_id).trim(),
    shooterName: String(parsedRow.data.shooter_name).trim(),
    date: buildDate(year, month, day),
    year,
    month,
    day,
    period,
    startGameClock: parseNumber(parsedRow.data.start_game_clock),
    endGameClock: parseNumber(parsedRow.data.end_game_clock),
    shotClock: parseNumber(parsedRow.data.shot_clock),
    x: parseNumber(parsedRow.data.x),
    y: parseNumber(parsedRow.data.y),
    made: parseBoolean(parsedRow.data.outcome),
    assisted,
    astOpp: parseBoolean(parsedRow.data.ast_opp),
    blocked: parseBoolean(parsedRow.data.blocked),
    fouled: parseBoolean(parsedRow.data.fouled),
    shotType,
    complexShotType,
    contested,
    contestLevel,
    catchAndShoot,
    dribblesBefore,
    shotClockBucket: getShotClockBucket(parseNumber(parsedRow.data.shot_clock)),
    creationType: getCreationType({
      catchAndShoot,
    }),
  };

  return shotRecordSchema.safeParse(normalized).success ? normalized : null;
}
