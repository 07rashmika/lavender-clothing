import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { RemoveCartItemDto } from './dto/remove-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private async list(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true, customization: true },
      orderBy: { createdAt: 'asc' },
    });

    return items.map((item) => ({
      id: item.productId ?? `customization:${item.customizationId}`,
      customizationId: item.customizationId ?? undefined,
      name: item.product?.name ?? 'Custom T-Shirt',
      price: item.product ? item.product.priceCents / 100 : (item.customization?.estimatedPriceCents ?? 4500) / 100,
      image: item.product?.images[0] ?? item.customization?.designPreview ?? '',
      color: item.color,
      colorSwatch: item.colorSwatch ?? undefined,
      size: item.size,
      quantity: item.quantity,
      badge: item.product?.tag ?? (item.customization ? 'CUSTOM' : undefined),
      material: item.customization?.fabric ?? undefined,
      customizationConfig: item.customization?.designConfig ?? undefined,
    }));
  }

  async findAll(userId: string) {
    return this.list(userId);
  }

  async add(userId: string, dto: AddCartItemDto) {
    const existing = await this.prisma.cartItem.findUnique({
      where: {
        userId_productId_color_size: {
          userId,
          productId: dto.productId,
          color: dto.color,
          size: dto.size,
        },
      },
    });

    if (existing) {
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + (dto.quantity ?? 1) },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          userId,
          productId: dto.productId,
          color: dto.color,
          colorSwatch: dto.colorSwatch,
          size: dto.size,
          quantity: dto.quantity ?? 1,
        },
      });
    }

    return this.list(userId);
  }

  async addCustomization(userId: string, customizationId: string, quantity = 1) {
    const customization = await this.prisma.customization.findFirst({ where: { id: customizationId, userId } });
    if (!customization) throw new NotFoundException('Saved design not found');
    const existing = await this.prisma.cartItem.findFirst({ where: { userId, customizationId, size: customization.size ?? 'S' } });
    if (existing) {
      await this.prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + quantity } });
    } else {
      await this.prisma.cartItem.create({ data: { userId, customizationId, color: customization.color, colorSwatch: customization.color, size: customization.size ?? 'S', quantity } });
    }
    await this.prisma.customization.update({ where: { id: customizationId }, data: { addedToBag: true } });
    return this.list(userId);
  }

  async updateCustomization(userId: string, customizationId: string, quantity: number) {
    const item = await this.prisma.cartItem.findFirst({ where: { userId, customizationId } });
    if (!item) throw new NotFoundException('Custom design is not in the cart');
    await this.prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
    return this.list(userId);
  }

  async removeCustomization(userId: string, customizationId: string) {
    await this.prisma.cartItem.deleteMany({ where: { userId, customizationId } });
    return this.list(userId);
  }

  async update(userId: string, productId: string, dto: UpdateCartItemDto) {
    const existing = await this.prisma.cartItem.findUnique({
      where: {
        userId_productId_color_size: {
          userId,
          productId,
          color: dto.color,
          size: dto.size,
        },
      },
    });
    if (!existing) {
      throw new NotFoundException('Cart item not found');
    }
    await this.prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: dto.quantity },
    });
    return this.list(userId);
  }

  async remove(userId: string, productId: string, query: RemoveCartItemDto) {
    await this.prisma.cartItem.deleteMany({
      where: { userId, productId, color: query.color, size: query.size },
    });
    return this.list(userId);
  }

  async clear(userId: string) {
    await this.prisma.cartItem.deleteMany({ where: { userId } });
    return [];
  }
}
