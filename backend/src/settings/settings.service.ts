import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const SETTINGS_ID = 1;

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    return this.prisma.storeSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID },
      update: {},
    });
  }

  async getPublic() {
    const settings = await this.get();
    return {
      shippingFeeCents: settings.shippingFeeCents,
      codFeeCents: settings.codFeeCents,
      taxRateBps: settings.taxRateBps,
      freeShipThresholdCents: settings.freeShipThresholdCents,
    };
  }

  async update(dto: UpdateSettingsDto) {
    await this.get();
    return this.prisma.storeSettings.update({
      where: { id: SETTINGS_ID },
      data: dto,
    });
  }
}
