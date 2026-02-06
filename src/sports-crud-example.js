import { eq } from 'drizzle-orm';
import { db, pool } from './db/db.js';
import { matches, commentary } from './db/schema.js';

async function main() {
  try {
    console.log('🏆 Performing CRUD operations on sports database...\n');

    // ========================================
    // CREATE: Insert a new match
    // ========================================
    const [newMatch] = await db
      .insert(matches)
      .values({
        sport: 'Football',
        homeTeam: 'Manchester United',
        awayTeam: 'Liverpool',
        status: 'scheduled',
        startTime: new Date('2026-02-10T15:00:00Z'),
        homeScore: 0,
        awayScore: 0,
      })
      .returning();

    if (!newMatch) {
      throw new Error('Failed to create match');
    }

    console.log('✅ CREATE MATCH: New match created:');
    console.log(`   ID: ${newMatch.id}`);
    console.log(`   ${newMatch.homeTeam} vs ${newMatch.awayTeam}`);
    console.log(`   Status: ${newMatch.status}`);
    console.log(`   Start Time: ${newMatch.startTime}\n`);

    // ========================================
    // CREATE: Add commentary entries
    // ========================================
    const commentaryEntries = [
      {
        matchId: newMatch.id,
        minute: 0,
        sequence: 1,
        period: '1st Half',
        eventType: 'kickoff',
        message: 'Match kicks off!',
        tags: ['start', 'kickoff'],
      },
      {
        matchId: newMatch.id,
        minute: 15,
        sequence: 2,
        period: '1st Half',
        eventType: 'goal',
        actor: 'Marcus Rashford',
        team: 'Manchester United',
        message: 'GOAL! Marcus Rashford scores for Manchester United!',
        metadata: { assistedBy: 'Bruno Fernandes', scoreAfter: { home: 1, away: 0 } },
        tags: ['goal', 'home'],
      },
      {
        matchId: newMatch.id,
        minute: 30,
        sequence: 3,
        period: '1st Half',
        eventType: 'yellow_card',
        actor: 'Virgil van Dijk',
        team: 'Liverpool',
        message: 'Yellow card for Virgil van Dijk',
        tags: ['card', 'away'],
      },
    ];

    const insertedCommentary = await db
      .insert(commentary)
      .values(commentaryEntries)
      .returning();

    console.log(`✅ CREATE COMMENTARY: Added ${insertedCommentary.length} commentary entries\n`);

    // ========================================
    // READ: Fetch the match with commentary
    // ========================================
    const [foundMatch] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, newMatch.id));

    console.log('✅ READ MATCH: Found match:');
    console.log(`   ${foundMatch.homeTeam} ${foundMatch.homeScore} - ${foundMatch.awayScore} ${foundMatch.awayTeam}`);
    console.log(`   Status: ${foundMatch.status}\n`);

    const matchCommentary = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, newMatch.id))
      .orderBy(commentary.sequence);

    console.log('✅ READ COMMENTARY: Match commentary:');
    matchCommentary.forEach((entry) => {
      console.log(`   ${entry.minute}' [${entry.eventType}] ${entry.message}`);
    });
    console.log('');

    // ========================================
    // UPDATE: Update match status and score
    // ========================================
    const [updatedMatch] = await db
      .update(matches)
      .set({
        status: 'live',
        homeScore: 1,
        awayScore: 0,
      })
      .where(eq(matches.id, newMatch.id))
      .returning();

    if (!updatedMatch) {
      throw new Error('Failed to update match');
    }

    console.log('✅ UPDATE MATCH: Match updated to live:');
    console.log(`   ${updatedMatch.homeTeam} ${updatedMatch.homeScore} - ${updatedMatch.awayScore} ${updatedMatch.awayTeam}`);
    console.log(`   Status: ${updatedMatch.status}\n`);

    // ========================================
    // UPDATE: Update a commentary entry
    // ========================================
    const [firstCommentary] = matchCommentary;
    await db
      .update(commentary)
      .set({
        message: 'Match kicks off at Old Trafford!',
        metadata: { stadium: 'Old Trafford', attendance: 75000 },
      })
      .where(eq(commentary.id, firstCommentary.id));

    console.log('✅ UPDATE COMMENTARY: Commentary entry updated\n');

    // ========================================
    // DELETE: Remove commentary entries
    // ========================================
    const deletedCommentaryCount = await db
      .delete(commentary)
      .where(eq(commentary.matchId, newMatch.id));

    console.log(`✅ DELETE COMMENTARY: Deleted ${matchCommentary.length} commentary entries\n`);

    // ========================================
    // DELETE: Remove the match
    // ========================================
    await db.delete(matches).where(eq(matches.id, newMatch.id));
    console.log('✅ DELETE MATCH: Match deleted successfully\n');

    console.log('========================================');
    console.log('🎉 All CRUD operations completed successfully!');
    console.log('========================================');

  } catch (error) {
    console.error('❌ Error performing CRUD operations:', error);
    process.exit(1);
  } finally {
    // Close the connection pool
    if (pool) {
      await pool.end();
      console.log('\n✅ Database pool closed.');
    }
  }
}

main();
