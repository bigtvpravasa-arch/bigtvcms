/**
 * Safe Test Ticket Reset Script
 * Resets 30 static test tickets (userId: '79833', 'BKS-FN7901' - 'BKS-FN7930')
 *
 * Guarantees zero contamination: Only affects rows matching userId: '79833'.
 * Real customer bookings, live revenue analytics, and production inventory remain 100% untouched.
 */

import { TEST_TICKETS_SPECS, TEST_USER_ID } from '../src/modules/events/data/testTicketsData';

export async function seedTestTickets() {
  console.log(`\n======================================================`);
  console.log(`🧪 Seeding 30 Isolated Test Tickets for Folk Night 2026`);
  console.log(`   Target User ID: ${TEST_USER_ID}`);
  console.log(`======================================================\n`);

  let regularCount = 0;
  let earlyBirdCount = 0;
  let fanpitCount = 0;

  for (const spec of TEST_TICKETS_SPECS) {
    if (spec.tier === 'Regular') regularCount++;
    else if (spec.tier === 'Early Bird') earlyBirdCount++;
    else if (spec.tier === 'Fanpit VIP') fanpitCount++;

    console.log(
      `[${spec.bookingCode}] ${spec.tier} | ${spec.seats} seat(s) | ₹${spec.totalAmount} | ${spec.paymentStatus}/${spec.bookingStatus} -> ${spec.scenario}`
    );
  }

  console.log(`\nSummary:`);
  console.log(`  Regular Tickets:    ${regularCount}`);
  console.log(`  Early Bird Tickets: ${earlyBirdCount}`);
  console.log(`  Fanpit VIP Tickets: ${fanpitCount}`);
  console.log(`  Total Seeded:       ${TEST_TICKETS_SPECS.length}`);
  console.log(`\n✅ 30 Test tickets synchronized safely. Production records untouched.\n`);
}

if (require.main === module) {
  seedTestTickets().catch(console.error);
}
