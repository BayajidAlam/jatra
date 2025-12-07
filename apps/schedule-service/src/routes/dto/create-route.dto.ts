import { IsString, IsNumber, IsBoolean, IsOptional, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRouteStopDto {
  @ApiProperty({ 
    description: 'From station ID',
    example: 'station-uuid-1' 
  })
  @IsString()
  fromStationId: string;

  @ApiProperty({ 
    description: 'To station ID',
    example: 'station-uuid-2' 
  })
  @IsString()
  toStationId: string;

  @ApiProperty({ 
    description: 'Order of this stop in the route (starts from 1)',
    example: 1 
  })
  @IsNumber()
  @Min(1)
  stopOrder: number;

  @ApiProperty({ 
    description: 'Distance from the start station in kilometers',
    example: 50.5 
  })
  @IsNumber()
  @Min(0)
  distanceFromStart: number;

  @ApiProperty({ 
    description: 'Duration in minutes from the previous stop',
    example: 60 
  })
  @IsNumber()
  @Min(0)
  durationMinutes: number;
}

export class CreateRouteDto {
  @ApiProperty({ 
    description: 'Name of the route',
    example: 'Dhaka-Chittagong' 
  })
  @IsString()
  routeName: string;

  @ApiProperty({ 
    description: 'Total distance of the route in kilometers',
    example: 264.5 
  })
  @IsNumber()
  @Min(0)
  totalDistance: number;

  @ApiProperty({ 
    description: 'Whether the route is active',
    default: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ 
    description: 'Array of route stops',
    type: [CreateRouteStopDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRouteStopDto)
  stops: CreateRouteStopDto[];
}
