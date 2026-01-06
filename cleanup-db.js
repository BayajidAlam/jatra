require('dotenv').config({ path: './apps/seat-reservation-service/.env' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupAllExpiredReservations() {
  try {
    console.log('🧹 Cleaning up expired and locked reservations...\n');

    // Delete all LOCKED and EXPIRED reservations
    const deleted = await prisma.reservation.deleteMany({
      where: {
        status: { in: ['LOCKED', 'EXPIRED'] }
      }
    });

    console.log(`✅ Deleted ${deleted.count} LOCKED/EXPIRED reservations`);
    console.log('\n✨ Database cleaned! You can now book tickets without limit errors.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupAllExpiredReservations();
