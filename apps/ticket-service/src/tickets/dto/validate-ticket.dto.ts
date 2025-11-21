import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ValidateTicketDto {
  @ApiProperty({ example: 'TKT-20251122-12345', description: 'Ticket number to validate' })
  @IsString()
  @IsNotEmpty()
  ticketNumber: string;

  @ApiProperty({ example: 'staff-001', description: 'Staff ID validating the ticket' })
  @IsString()
  @IsNotEmpty()
  validatedBy: string;
}
