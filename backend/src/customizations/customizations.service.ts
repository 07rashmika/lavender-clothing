import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomizationDto } from './dto/create-customization.dto';
import { UpdateCustomizationStatusDto } from './dto/update-customization-status.dto';

@Injectable()
export class CustomizationsService {
  constructor(private readonly prisma: PrismaService) {}

  private generateRequestNumber(): string {
    return `CX-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  async create(userId: string, dto: CreateCustomizationDto) {
    return this.prisma.customization.create({
      data: {
        requestNumber: this.generateRequestNumber(),
        userId,
        fabric: dto.fabric,
        color: dto.color,
        cut: dto.cut,
        size: dto.size,
        notes: dto.notes ?? '',
        urgent: dto.urgent ?? false,
        estimatedPriceCents: dto.estimatedPriceCents,
      },
    });
  }

  async findAll() {
    return this.prisma.customization.findMany({
      include: { user: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMine(userId: string) {
    return this.prisma.customization.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, dto: UpdateCustomizationStatusDto) {
    const existing = await this.prisma.customization.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Customization request not found');
    }
    return this.prisma.customization.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}
