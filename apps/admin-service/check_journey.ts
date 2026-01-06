import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const journeyId = 'c58426a3-5f8e-4438-b8bd-2f1a604cd170';
  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    include: {
      train: {
        include: {
          coaches: {
            include: {
              seats: true
            }
          }
        }
      }
    }
  });

  if (!journey) {
    console.log('Journey not found');
    return;
  }

  console.log('Journey:', journey.id);
  console.log('Train:', journey.train.name);
  let totalSeats = 0;
  journey.train.coaches.forEach(coach => {
    totalSeats += coach.seats.length;
    console.log(`Coach ${coach.name}: ${coach.seats.length} seats`);
  });
  console.log('Total Seats for Train:', totalSeats);
}

main().catch(console.error).finally(() => prisma.$disconnect());
