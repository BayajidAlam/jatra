import { IsString, IsDateString, IsEnum, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum JourneyStatus {
  SCHEDULED = 'SCHEDULED',
  DELAYED = 'DELAYED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export class CreateJourneyDto {
  @ApiProperty({ 
    description: 'Train ID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' 
  })
  @IsString()
  trainId: string;

  @ApiProperty({ 
    description: 'Route ID',
    example: 'a8f5f167-aa29-4bb1-8a5d-8f5d7c8e9f0a' 
  })
  @IsString()
  routeId: string;

  @ApiProperty({ 
    description: 'Journey departure time (ISO 8601)',
    example: '2025-12-07T08:00:00Z' 
  })
  @IsDateString()
  departureTime: string;

  @ApiProperty({ 
    description: 'Journey arrival time (ISO 8601)',
    example: '2025-12-07T14:00:00Z' 
  })
  @IsDateString()
  arrivalTime: string;

  @ApiProperty({ 
    description: 'Journey date (YYYY-MM-DD)',
    example: '2025-12-07' 
  })
  @IsDateString()
  journeyDate: string;

  @ApiProperty({ 
    description: 'Journey status',
    enum: JourneyStatus, 
    default: JourneyStatus.SCHEDULED,
    required: false
  })
  @IsEnum(JourneyStatus)
  @IsOptional()
  status?: JourneyStatus;

  @ApiProperty({ 
    description: 'Total seats available on this journey',
    example: 180 
  })
  @IsInt()
  @Min(0)
  totalSeats: number;

  @ApiProperty({ 
    description: 'Currently available seats',
    example: 180 
  })
  @IsInt()
  @Min(0)
  availableSeats: number;
}
