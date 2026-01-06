-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BookingStatus" ADD VALUE 'PAYMENT_PROCESSING';
ALTER TYPE "BookingStatus" ADD VALUE 'PAYMENT_FAILED';

-- AlterEnum
ALTER TYPE "NotificationChannel" ADD VALUE 'BOTH';

-- AlterEnum
ALTER TYPE "NotificationStatus" ADD VALUE 'RETRY';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'OTP';
ALTER TYPE "NotificationType" ADD VALUE 'BOOKING_CONFIRMATION';
ALTER TYPE "NotificationType" ADD VALUE 'PAYMENT_SUCCESS';
ALTER TYPE "NotificationType" ADD VALUE 'SEAT_EXPIRY_WARNING';

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_paymentId_fkey";

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ALTER COLUMN "paymentId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "booking_passengers" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "seatId" TEXT NOT NULL,
    "seatNumber" VARCHAR(10) NOT NULL,
    "passengerName" VARCHAR(255) NOT NULL,
    "passengerAge" INTEGER NOT NULL,
    "passengerGender" VARCHAR(20) NOT NULL,
    "fare" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_passengers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passengers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" VARCHAR(255) NOT NULL,
    "dateOfBirth" DATE NOT NULL,
    "gender" VARCHAR(20) NOT NULL,
    "nidNumber" VARCHAR(50),
    "passportNumber" VARCHAR(50),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passengers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booking_passengers_bookingId_idx" ON "booking_passengers"("bookingId");

-- CreateIndex
CREATE INDEX "passengers_userId_idx" ON "passengers"("userId");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_passengers" ADD CONSTRAINT "booking_passengers_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passengers" ADD CONSTRAINT "passengers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
