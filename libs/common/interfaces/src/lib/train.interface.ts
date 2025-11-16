export interface Train {
  id: string;
  name: string;
  trainNumber: string;
  type: TrainType;
  status: TrainStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum TrainType {
  INTERCITY = "INTERCITY",
  MAIL_EXPRESS = "MAIL_EXPRESS",
  LOCAL = "LOCAL",
  COMMUTER = "COMMUTER",
}

export enum TrainStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  MAINTENANCE = "MAINTENANCE",
}

export interface TrainSchedule {
  id: string;
  trainId: string;
  routeId: string;
  departureStationId: string;
  arrivalStationId: string;
  departureTime: string; // Format: HH:mm
  arrivalTime: string; // Format: HH:mm
  validFrom: Date;
  validUntil: Date;
  daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
}

export interface Route {
  id: string;
  name: string;
  stations: RouteStation[];
}

export interface RouteStation {
  stationId: string;
  sequence: number;
  arrivalTime?: string;
  departureTime?: string;
  stopDuration?: number; // minutes
}

export interface Station {
  id: string;
  name: string;
  code: string;
  city: string;
  region: "EASTERN" | "WESTERN";
}

export interface Coach {
  id: string;
  trainId: string;
  coachNumber: string;
  coachType: CoachType;
  totalSeats: number;
}

export enum CoachType {
  AC_CHAIR = "AC_CHAIR",
  AC_BERTH = "AC_BERTH",
  FIRST_CLASS = "FIRST_CLASS",
  SNIGDHA = "SNIGDHA",
  SHOVAN = "SHOVAN",
  SHULOV = "SHULOV",
}

export interface Seat {
  id: string;
  coachId: string;
  seatNumber: string;
  fare: number;
}
