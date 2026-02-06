import { pgTable, serial, text, integer, timestamp, pgEnum, jsonb } from 'drizzle-orm/pg-core';

// Define match status enum
export const matchStatusEnum = pgEnum('match_status', ['scheduled', 'live', 'finished']);

// Matches table - stores information about sports matches
export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  sport: text('sport').notNull(),
  homeTeam: text('home_team').notNull(),
  awayTeam: text('away_team').notNull(),
  status: matchStatusEnum('status').notNull().default('scheduled'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  homeScore: integer('home_score').notNull().default(0),
  awayScore: integer('away_score').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Commentary table - stores real-time commentary for matches
export const commentary = pgTable('commentary', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id')
    .notNull()
    .references(() => matches.id, { onDelete: 'cascade' }),
  minute: integer('minute'),
  sequence: integer('sequence').notNull(),
  period: text('period'),
  eventType: text('event_type').notNull(),
  actor: text('actor'),
  team: text('team'),
  message: text('message').notNull(),
  metadata: jsonb('metadata'),
  tags: text('tags').array(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Export TypeScript types for type-safe queries
export const Match = matches.$inferSelect;
export const NewMatch = matches.$inferInsert;
export const Commentary = commentary.$inferSelect;
export const NewCommentary = commentary.$inferInsert;
