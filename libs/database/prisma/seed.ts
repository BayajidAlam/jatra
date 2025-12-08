import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Stations
  const dhaka = await prisma.station.upsert({
    where: { code: 'DHK' },
    update: {},
    create: {
      code: 'DHK',
      name: 'Kamalapur Railway Station',
      city: 'Dhaka',
      district: 'Dhaka',
      latitude: 23.7304,
      longitude: 90.4177,
    },
  });

  const chittagong = await prisma.station.upsert({
    where: { code: 'CTG' },
    update: {},
    create: {
      code: 'CTG',
      name: 'Chittagong Railway Station',
      city: 'Chittagong',
      district: 'Chittagong',
      latitude: 22.3569,
      longitude: 91.7832,
    },
  });

  const sylhet = await prisma.station.upsert({
    where: { code: 'SYL' },
    update: {},
    create: {
      code: 'SYL',
      name: 'Sylhet Railway Station',
      city: 'Sylhet',
      district: 'Sylhet',
      latitude: 24.8949,
      longitude: 91.8687,
    },
  });

  const rajshahi = await prisma.station.upsert({
    where: { code: 'RAJ' },
    update: {},
    create: {
      code: 'RAJ',
      name: 'Rajshahi Railway Station',
      city: 'Rajshahi',
      district: 'Rajshahi',
      latitude: 24.3745,
      longitude: 88.6042,
    },
  });

  console.log('✅ Stations created');

  // Create Trains
  const subornoExpress = await prisma.train.upsert({
    where: { trainNumber: 'SUBORNO-EXPRESS-701' },
    update: {},
    create: {
      trainNumber: 'SUBORNO-EXPRESS-701',
      name: 'Suborno Express',
      type: 'INTERCITY',
    },
  });

  const turnaExpress = await prisma.train.upsert({
    where: { trainNumber: 'TURNA-EXPRESS-741' },
    update: {},
    create: {
      trainNumber: 'TURNA-EXPRESS-741',
      name: 'Turna Nishitha',
      type: 'MAIL_EXPRESS',
    },
  });

  const parabatExpress = await prisma.train.upsert({
    where: { trainNumber: 'PARABAT-EXPRESS-791' },
    update: {},
    create: {
      trainNumber: 'PARABAT-EXPRESS-791',
      name: 'Parabat Express',
      type: 'INTERCITY',
    },
  });

  console.log('✅ Trains created');

  // Create Coaches for Suborno Express
  const kaCoach = await prisma.coach.upsert({
    where: {
      trainId_coachCode: {
        trainId: subornoExpress.id,
        coachCode: 'KA',
      },
    },
    update: {},
    create: {
      trainId: subornoExpress.id,
      coachCode: 'KA',
      coachType: 'AC_BERTH',
      totalSeats: 40,
    },
  });

  const khaCoach = await prisma.coach.upsert({
    where: {
      trainId_coachCode: {
        trainId: subornoExpress.id,
        coachCode: 'KHA',
      },
    },
    update: {},
    create: {
      trainId: subornoExpress.id,
      coachCode: 'KHA',
      coachType: 'AC_SEAT',
      totalSeats: 60,
    },
  });

  const gaCoach = await prisma.coach.upsert({
    where: {
      trainId_coachCode: {
        trainId: subornoExpress.id,
        coachCode: 'GA',
      },
    },
    update: {},
    create: {
      trainId: subornoExpress.id,
      coachCode: 'GA',
      coachType: 'SHOVAN',
      totalSeats: 80,
    },
  });

  console.log('✅ Coaches created');

  // Create Seats for KA Coach (AC Berth)
  for (let i = 1; i <= 40; i++) {
    const seatNumber = `A${i}`;
    const seatType = i % 2 === 0 ? 'BERTH_UPPER' : 'BERTH_LOWER';
    await prisma.seat.upsert({
      where: {
        coachId_seatNumber: {
          coachId: kaCoach.id,
          seatNumber,
        },
      },
      update: {},
      create: {
        coachId: kaCoach.id,
        seatNumber,
        seatType,
        baseFare: 2000,
      },
    });
  }

  // Create Seats for KHA Coach (AC Seat)
  for (let i = 1; i <= 60; i++) {
    await prisma.seat.upsert({
      where: {
        coachId_seatNumber: {
          coachId: khaCoach.id,
          seatNumber: `B${i}`,
        },
      },
      update: {},
      create: {
        coachId: khaCoach.id,
        seatNumber: `B${i}`,
        seatType: 'SEAT',
        baseFare: 1500,
      },
    });
  }

  // Create Seats for GA Coach (Shovan)
  for (let i = 1; i <= 80; i++) {
    await prisma.seat.upsert({
      where: {
        coachId_seatNumber: {
          coachId: gaCoach.id,
          seatNumber: `C${i}`,
        },
      },
      update: {},
      create: {
        coachId: gaCoach.id,
        seatNumber: `C${i}`,
        seatType: 'CHAIR',
        baseFare: 800,
      },
    });
  }

  console.log('✅ Seats created');

  // Create Routes
  const dhakaCTGRoute = await prisma.route.create({
    data: {
      routeName: 'Dhaka-Chittagong',
      totalDistance: 320,
      stops: {
        create: [
          {
            fromStationId: dhaka.id,
            toStationId: chittagong.id,
            stopOrder: 1,
            distanceFromStart: 0,
            durationMinutes: 360,
          },
        ],
      },
    },
  });

  const dhakaSYLRoute = await prisma.route.create({
    data: {
      routeName: 'Dhaka-Sylhet',
      totalDistance: 280,
      stops: {
        create: [
          {
            fromStationId: dhaka.id,
            toStationId: sylhet.id,
            stopOrder: 1,
            distanceFromStart: 0,
            durationMinutes: 420,
          },
        ],
      },
    },
  });

  const dhakaRAJRoute = await prisma.route.create({
    data: {
      routeName: 'Dhaka-Rajshahi',
      totalDistance: 260,
      stops: {
        create: [
          {
            fromStationId: dhaka.id,
            toStationId: rajshahi.id,
            stopOrder: 1,
            distanceFromStart: 0,
            durationMinutes: 390,
          },
        ],
      },
    },
  });

  console.log('✅ Routes created');

  // Delete old journeys
  await prisma.journey.deleteMany({});
  
  // Create Journeys for the next 7 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const journeyDate = new Date(today);
    journeyDate.setDate(today.getDate() + i);

    // Suborno Express to Chittagong
    const departureTime = new Date(journeyDate);
    departureTime.setHours(8, 0, 0);
    const arrivalTime = new Date(departureTime);
    arrivalTime.setHours(14, 0, 0);

    await prisma.journey.create({
      data: {
        trainId: subornoExpress.id,
        routeId: dhakaCTGRoute.id,
        departureTime,
        arrivalTime,
        journeyDate,
        status: 'SCHEDULED',
        availableSeats: 180,
        totalSeats: 180,
      },
    });

    // Turna Express to Sylhet
    const turnaDepartureTime = new Date(journeyDate);
    turnaDepartureTime.setHours(21, 30, 0);
    const turnaArrivalTime = new Date(turnaDepartureTime);
    turnaArrivalTime.setHours(28, 30, 0); // Next day 4:30 AM

    await prisma.journey.create({
      data: {
        trainId: turnaExpress.id,
        routeId: dhakaSYLRoute.id,
        departureTime: turnaDepartureTime,
        arrivalTime: turnaArrivalTime,
        journeyDate,
        status: 'SCHEDULED',
        availableSeats: 150,
        totalSeats: 150,
      },
    });

    // Parabat Express to Rajshahi
    const parabatDepartureTime = new Date(journeyDate);
    parabatDepartureTime.setHours(15, 0, 0);
    const parabatArrivalTime = new Date(parabatDepartureTime);
    parabatArrivalTime.setHours(21, 30, 0);

    await prisma.journey.create({
      data: {
        trainId: parabatExpress.id,
        routeId: dhakaRAJRoute.id,
        departureTime: parabatDepartureTime,
        arrivalTime: parabatArrivalTime,
        journeyDate,
        status: 'SCHEDULED',
        availableSeats: 180,
        totalSeats: 180,
      },
    });
  }

  console.log('✅ Journeys created for the next 7 days');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
