import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nid: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    // Check if phone is being updated and if it's already taken
    if (updateProfileDto.phone) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          phone: updateProfileDto.phone,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw new ConflictException("Phone number already in use");
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
      select: {
        id: true,
        nid: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        updatedAt: true,
      },
    });

    return user;
  }
}
