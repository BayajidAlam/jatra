// Cleanup script for specific user
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupUserReservations() {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: 'bayzedalam2001@gmail.com' }
    });

    if (!user) {
      console.log('User not found with email: bayzedalam2001@gmail.com');
      return;
    }

    console.log(`Found user: ${user.name} (${user.email})`);
    console.log(`User ID: ${user.id}\n`);

    // Find all reservations for this user
    const reservations = await prisma.reservation.findMany({
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

    console.log(`Total reservations: ${reservations.length}\n`);

    if (reservations.length > 0) {
      console.log('=== User Reservations ===');
      reservations.forEach((res, idx) => {
        console.log(`${idx + 1}. Status: ${res.status}, Seats: ${res.seatIds.length}, Journey: ${res.journey?.departureTime}`);
      });

      // Delete all LOCKED and EXPIRED reservations for this user
      const deleted = await prisma.reservation.deleteMany({
        where: {
          userId: user.id,
          status: { in: ['LOCKED', 'EXPIRED'] }
        }
      });

      console.log(`\n✅ Deleted ${deleted.count} LOCKED/EXPIRED reservations for ${user.email}`);
      console.log('You can now book tickets without the 4-seat limit error!');
    } else {
      console.log('No reservations found for this user.');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupUserReservations();
