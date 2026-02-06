# 🏆 Sports Application Database Schema

Complete database schema for a real-time sports application built with Drizzle ORM and PostgreSQL (Neon).

## 📋 Schema Overview

### **Enums**

#### `match_status`
Represents the current state of a match.
- `scheduled` - Match is scheduled but not started
- `live` - Match is currently in progress
- `finished` - Match has ended

---

## 📊 Tables

### 1️⃣ **matches** Table

Stores information about sports matches.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `serial` | Primary Key | Unique match identifier |
| `sport` | `text` | NOT NULL | Type of sport (Football, Basketball, etc.) |
| `home_team` | `text` | NOT NULL | Name of the home team |
| `away_team` | `text` | NOT NULL | Name of the away team |
| `status` | `match_status` | NOT NULL, DEFAULT 'scheduled' | Current match status |
| `start_time` | `timestamp` | NOT NULL | When the match starts/started |
| `end_time` | `timestamp` | NULL | When the match ended (null if not finished) |
| `home_score` | `integer` | NOT NULL, DEFAULT 0 | Home team's score |
| `away_score` | `integer` | NOT NULL, DEFAULT 0 | Away team's score |
| `created_at` | `timestamp` | NOT NULL, DEFAULT NOW() | When the record was created |

**JavaScript Variable Name:** `matches`

**Example Usage:**
```javascript
import { matches } from './db/schema.js';
import { db } from './db/db.js';

// Create a new match
const [newMatch] = await db.insert(matches).values({
  sport: 'Football',
  homeTeam: 'Team A',
  awayTeam: 'Team B',
  status: 'scheduled',
  startTime: new Date('2026-02-10T15:00:00Z'),
}).returning();
```

---

### 2️⃣ **commentary** Table

Stores real-time commentary and events for matches.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `serial` | Primary Key | Unique commentary entry identifier |
| `match_id` | `integer` | NOT NULL, Foreign Key → matches.id (CASCADE DELETE) | Reference to the match |
| `minute` | `integer` | NULL | Match minute when event occurred |
| `sequence` | `integer` | NOT NULL | Order of events (for sorting) |
| `period` | `text` | NULL | Match period (1st Half, 2nd Half, Extra Time, etc.) |
| `event_type` | `text` | NOT NULL | Type of event (goal, card, substitution, etc.) |
| `actor` | `text` | NULL | Player or person involved in the event |
| `team` | `text` | NULL | Which team the event is related to |
| `message` | `text` | NOT NULL | Human-readable commentary message |
| `metadata` | `jsonb` | NULL | Additional structured data (assists, stats, etc.) |
| `tags` | `text[]` | NULL | Array of tags for filtering/searching |
| `created_at` | `timestamp` | NOT NULL, DEFAULT NOW() | When the commentary was created |

**JavaScript Variable Name:** `commentary`

**Relationship:** Each commentary entry belongs to one match. If a match is deleted, all its commentary entries are automatically deleted (cascade).

**Example Usage:**
```javascript
import { commentary } from './db/schema.js';
import { db } from './db/db.js';

// Add commentary entry
const [entry] = await db.insert(commentary).values({
  matchId: 1,
  minute: 23,
  sequence: 5,
  period: '1st Half',
  eventType: 'goal',
  actor: 'John Doe',
  team: 'Team A',
  message: 'GOAL! John Doe scores for Team A!',
  metadata: { assistedBy: 'Jane Smith', scoreAfter: { home: 1, away: 0 } },
  tags: ['goal', 'home'],
}).returning();
```

---

## 🎯 Naming Conventions

This schema follows these conventions:

✅ **JavaScript Variables:** `camelCase`
- `homeTeam`, `awayTeam`, `matchId`, `eventType`

✅ **Database Columns:** `snake_case`
- `home_team`, `away_team`, `match_id`, `event_type`

✅ **Table Names:** `lowercase`
- `matches`, `commentary`

✅ **Enums:** `snake_case`
- `match_status`

Drizzle ORM automatically handles the conversion between these naming conventions.

---

## 🔗 Relationships

```
matches (1) ──< (many) commentary
```

- One match can have many commentary entries
- Commentary entries cannot exist without a match
- Deleting a match cascades to delete all its commentary

---

## 📝 Type Exports

The schema exports TypeScript-compatible type definitions:

```javascript
// For SELECT queries (full row type)
export const Match = matches.$inferSelect;
export const Commentary = commentary.$inferSelect;

// For INSERT queries (optional auto-generated fields)
export const NewMatch = matches.$inferInsert;
export const NewCommentary = commentary.$inferInsert;
```

**Usage:**
```javascript
// The types are automatically inferred, providing autocomplete and type safety
const match = { sport: 'Football', homeTeam: 'A', awayTeam: 'B', ... };
```

---

## 🚀 Common Query Examples

### Create a Match
```javascript
const [match] = await db.insert(matches).values({
  sport: 'Basketball',
  homeTeam: 'Lakers',
  awayTeam: 'Warriors',
  status: 'scheduled',
  startTime: new Date('2026-02-15T20:00:00Z'),
}).returning();
```

### Get All Live Matches
```javascript
import { eq } from 'drizzle-orm';

const liveMatches = await db
  .select()
  .from(matches)
  .where(eq(matches.status, 'live'));
```

### Get Match with Commentary
```javascript
const match = await db
  .select()
  .from(matches)
  .where(eq(matches.id, matchId));

const comments = await db
  .select()
  .from(commentary)
  .where(eq(commentary.matchId, matchId))
  .orderBy(commentary.sequence);
```

### Update Match Score
```javascript
await db
  .update(matches)
  .set({ homeScore: 2, awayScore: 1, status: 'live' })
  .where(eq(matches.id, matchId));
```

### Add Goal Commentary
```javascript
await db.insert(commentary).values({
  matchId: 1,
  minute: 45,
  sequence: 10,
  period: '1st Half',
  eventType: 'goal',
  actor: 'Player Name',
  team: 'Home Team',
  message: 'GOAL! Amazing strike!',
  metadata: { 
    assistedBy: 'Assistant Name',
    goalType: 'left-foot',
    distance: '25 yards'
  },
  tags: ['goal', 'home', 'spectacular'],
});
```

### Get Commentary by Event Type
```javascript
const goals = await db
  .select()
  .from(commentary)
  .where(eq(commentary.eventType, 'goal'));
```

### Search Commentary by Tags
```javascript
import { arrayContains } from 'drizzle-orm/pg-core';

const homeGoals = await db
  .select()
  .from(commentary)
  .where(arrayContains(commentary.tags, ['goal', 'home']));
```

---

## 🎨 Event Types Examples

Common `event_type` values you might use:

- `kickoff` - Match start
- `goal` - Goal scored
- `penalty` - Penalty kick
- `yellow_card` - Yellow card shown
- `red_card` - Red card shown
- `substitution` - Player substitution
- `corner` - Corner kick
- `free_kick` - Free kick awarded
- `offside` - Offside called
- `injury` - Player injury
- `var_check` - VAR review
- `halftime` - Half-time break
- `fulltime` - Match end
- `extra_time` - Extra time period
- `penalty_shootout` - Penalty shootout

---

## 📦 File Location

**Schema file:** `src/db/schema.js`

**Database connection:** `src/db/db.js`

**Config file:** `drizzle.config.js` (points to this schema)

---

## ✅ Next Steps

1. Ensure your `.env` file has the correct `DATABASE_URL`
2. Generate migrations: `npm run db:generate`
3. Apply migrations: `npm run db:migrate`
4. Test with the example: `npm run sports-crud`

---

**Schema Version:** 1.0  
**Last Updated:** February 6, 2026
