import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateSettingDto, UpdateSettingDto } from './dto/setting.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.globalSetting.findMany({
      orderBy: { group: 'asc' },
    });
  }

  async findByKey(key: string) {
    const setting = await this.prisma.globalSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with key ${key} not found`);
    }

    return setting;
  }

  async upsert(dto: CreateSettingDto) {
    return this.prisma.globalSetting.upsert({
      where: { key: dto.key },
      update: {
        value: dto.value,
        type: dto.type,
        group: dto.group,
      },
      create: dto,
    });
  }

  async update(key: string, dto: UpdateSettingDto) {
    await this.findByKey(key);

    return this.prisma.globalSetting.update({
      where: { key },
      data: { value: dto.value },
    });
  }

  async remove(key: string) {
    await this.findByKey(key);

    await this.prisma.globalSetting.delete({
      where: { key },
    });

    return { message: `Setting ${key} deleted successfully` };
  }
}
