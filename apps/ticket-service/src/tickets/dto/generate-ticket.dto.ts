import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateTicketDto {
  @ApiProperty({ example: 'booking-uuid-here', description: 'Booking ID' })
  @IsString()
  @IsNotEmpty()
  bookingId: string;
}
