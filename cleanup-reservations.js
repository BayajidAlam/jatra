// Quick script to clean up test reservations
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/jatra_railway'
    }
  }
});

async function cleanupReservations() {
  try {
    console.log('Fetching all reservations...');
    
    const reservations = await prisma.reservation.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        },
        journey: {
          select: {
            departureTime: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    console.log('\n=== Recent Reservations ===');
    reservations.forEach((res, idx) => {
      console.log(`\n${idx + 1}. Reservation ID: ${res.id}`);
      console.log(`   User: ${res.user?.name} (${res.user?.email})`);
      console.log(`   Status: ${res.status}`);
      console.log(`   Seats: ${res.seatIds.length}`);
      console.log(`   Journey Date: ${res.journey?.departureTime}`);
      console.log(`   Created: ${res.createdAt}`);
    });

    console.log('\n\nTo delete all LOCKED or EXPIRED reservations, uncomment the delete code below.');
    
    // Uncomment to delete:
    // const deleted = await prisma.reservation.deleteMany({
    //   where: {
    //     status: {
    //       in: ['LOCKED', 'EXPIRED']
    //     }
    //   }
    // });
    // console.log(`\nDeleted ${deleted.count} reservations`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupReservations();
