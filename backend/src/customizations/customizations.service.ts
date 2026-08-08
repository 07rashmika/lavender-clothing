import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomizationDto } from './dto/create-customization.dto';
import { UpdateCustomizationStatusDto } from './dto/update-customization-status.dto';

@Injectable()
export class CustomizationsService {
  constructor(private readonly prisma: PrismaService) {}

  private generateRequestNumber(): string {
    return `CX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }

  async create(userId: string, dto: CreateCustomizationDto) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await this.prisma.customization.create({
          data: {
            requestNumber: this.generateRequestNumber(), userId, fabric: dto.fabric, color: dto.color,
            cut: dto.cut, size: dto.size, notes: dto.notes ?? '', customText: dto.customText,
            fontStyle: dto.fontStyle, designPreview: dto.designPreview,
            designConfig: dto.designConfig as Prisma.InputJsonValue | undefined,
            quantity: dto.quantity ?? 1,
            urgent: dto.urgent ?? false, estimatedPriceCents: dto.estimatedPriceCents,
          },
        });
      } catch (error) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002' || attempt === 2) throw error;
      }
    }
    throw new InternalServerErrorException('Unable to create customization request');
  }
  async update(userId: string, id: string, dto: CreateCustomizationDto) {
      return this.prisma.customization.update({
        where: {
          id,
          userId,
        },
        data: {
          fabric: dto.fabric,
          color: dto.color,
          cut: dto.cut,
          size: dto.size,
          quantity: dto.quantity,
          customText: dto.customText,
          fontStyle: dto.fontStyle,
          designPreview: dto.designPreview,
          notes: dto.notes,
          estimatedPriceCents: dto.estimatedPriceCents,
          designConfig: dto.designConfig as Prisma.InputJsonValue,
        },
      });
    }
  async remove(userId: string, id: string) {
      const customization = await this.prisma.customization.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!customization) {
        throw new NotFoundException("Design not found");
      }

      await this.prisma.customization.delete({
        where: {
          id,
        },
      });

      return { message: "Design deleted successfully" };
    }

  async findAll() {
    return this.prisma.customization.findMany({
      include: { user: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMine(userId: string) {
    return this.prisma.customization.findMany({
      where: { userId, addedToBag: false },
      orderBy: { createdAt: 'desc' },
    });
  }
    async findOne(userId: string, id: string) {
    return this.prisma.customization.findFirst({
      where: {
        id,
        userId,
      },
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
