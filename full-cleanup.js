const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Use the seat-reservation-service's Prisma client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/jatra_railway'
    }
  }
});

async function fullCleanup() {
  try {
    console.log('🧹 Starting full database cleanup...\n');

    // 1. Delete all LOCKED and EXPIRED reservations
    const deletedReservations = await prisma.reservation.deleteMany({
      where: {
        status: { in: ['LOCKED', 'EXPIRED'] }
      }
    });
    console.log(`✅ Deleted ${deletedReservations.count} LOCKED/EXPIRED reservations`);

    // 2. Find and show user's actual bookings
    const user = await prisma.user.findUnique({
      where: { email: 'bayzedalam2001@gmail.com' }
    });

    if (user) {
      const userBookings = await prisma.reservation.findMany({
        where: { userId: user.id },
        include: {
          journey: {
            select: {
              departureTime: true,
              train: { select: { name: true } }
            }
          }
        }
      });

      console.log(`\n📊 User ${user.email} has ${userBookings.length} reservations:`);
      userBookings.forEach((booking, idx) => {
        console.log(`  ${idx + 1}. Status: ${booking.status}, Seats: ${booking.seatIds.length}, Journey: ${booking.journey?.train?.name}`);
      });
    }

    console.log('\n✨ Cleanup complete! Try booking again now.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Manual SQL to run:');
    console.log('   DELETE FROM "Reservation" WHERE status IN (\'LOCKED\', \'EXPIRED\');');
  } finally {
    await prisma.$disconnect();
  }
}

fullCleanup();
