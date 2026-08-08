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
      include: { product: true },
      orderBy: { createdAt: 'asc' },
    });

    return items.map((item) => ({
      id: item.productId,
      name: item.product.name,
      price: item.product.priceCents / 100,
      image: item.product.images[0] ?? '',
      color: item.color,
      colorSwatch: item.colorSwatch ?? undefined,
      size: item.size,
      quantity: item.quantity,
      badge: item.product.tag ?? undefined,
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
