/*
This file defines the raw CSV and normalized shot record schemas used throughout the app.
It centralizes validation rules and shared record shape types for ingestion and analytics.
*/
import { z } from "zod";

import {
  COMPLEX_SHOT_TYPES,
  CONTEST_LEVELS,
  CREATION_TYPES,
  SHOT_CLOCK_BUCKETS,
  SHOT_TYPES,
  type ComplexShotType,
  type ContestLevel,
  type CreationType,
  type ShotClockBucket,
  type ShotType,
} from "./shotDomain";

//Raw shot record shape as read from CSV
export const rawShotCsvRowSchema = z.object({
  shooter_id: z.string(),
  shooter_name: z.string(),
  year: z.union([z.string(), z.number()]),
  month: z.union([z.string(), z.number()]),
  day: z.union([z.string(), z.number()]),
  period: z.union([z.string(), z.number()]),
  start_game_clock: z.union([z.string(), z.number()]),
  end_game_clock: z.union([z.string(), z.number()]),
  shot_clock: z.union([z.string(), z.number()]),
  x: z.union([z.string(), z.number()]),
  y: z.union([z.string(), z.number()]),
  outcome: z.union([z.string(), z.boolean()]),
  passer_x: z.union([z.string(), z.number()]),
  passer_y: z.union([z.string(), z.number()]),
  assisted: z.union([z.string(), z.boolean()]),
  ast_opp: z.union([z.string(), z.boolean()]),
  blocked: z.union([z.string(), z.boolean()]),
  fouled: z.union([z.string(), z.boolean()]),
  shot_type: z.string(),
  complex_shot_type: z.string(),
  contested: z.union([z.string(), z.boolean()]),
  contest_level: z.string(),
  catch_and_shoot: z.union([z.string(), z.boolean()]),
  dribbles_before: z.union([z.string(), z.number()]),
});

export type RawShotCsvRow = z.infer<typeof rawShotCsvRowSchema>;

export const shotTypeSchema = z.enum(SHOT_TYPES);
export const complexShotTypeSchema = z.enum(COMPLEX_SHOT_TYPES);
export const contestLevelSchema = z.enum(CONTEST_LEVELS);
export const creationTypeSchema = z.enum(CREATION_TYPES);
export const shotClockBucketSchema = z.enum(SHOT_CLOCK_BUCKETS);

//Normalized shot record shape
export const shotRecordSchema = z.object({
  shooterId: z.string(),
  shooterName: z.string(),
  date: z.string(),
  year: z.number().int(),
  month: z.number().int(),
  day: z.number().int(),
  period: z.number().int(),
  startGameClock: z.number().nullable(),
  endGameClock: z.number().nullable(),
  shotClock: z.number().nullable(),
  x: z.number().nullable(),
  y: z.number().nullable(),
  made: z.boolean(),
  assisted: z.boolean(),
  astOpp: z.boolean(),
  blocked: z.boolean(),
  fouled: z.boolean(),
  shotType: shotTypeSchema,
  complexShotType: complexShotTypeSchema,
  contested: z.boolean(),
  contestLevel: contestLevelSchema,
  catchAndShoot: z.boolean(),
  dribblesBefore: z.number().nullable(),
  shotClockBucket: shotClockBucketSchema,
  creationType: creationTypeSchema,
});

export type ShotRecord = z.infer<typeof shotRecordSchema>;

export type ShotTypeMetricMap<TValue> = Record<ShotType, TValue>;
export type NullableShotTypeMetricMap = Record<ShotType, number | null>;
export type NumericShotTypeMetricMap = Record<ShotType, number>;

export type { ShotType, ComplexShotType, ContestLevel, CreationType, ShotClockBucket };
