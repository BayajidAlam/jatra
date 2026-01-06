import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma.service';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Post('cleanup-expired')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clean up expired and locked reservations' })
  async cleanupExpired() {
    const deleted = await this.prisma.reservation.deleteMany({
      where: {
        status: { in: ['LOCKED', 'EXPIRED'] }
      }
    });

    return {
      message: 'Cleanup successful',
      deletedCount: deleted.count
    };
  }
}
