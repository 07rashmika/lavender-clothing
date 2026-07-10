import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  private async list(userId: string) {
    const items = await this.prisma.wishlistItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'asc' },
    });

    return items.map((item) => ({
      id: item.productId,
      name: item.product.name,
      price: item.product.priceCents / 100,
      image: item.product.images[0] ?? '',
      badge: item.product.tag ?? undefined,
      colorSwatch: item.product.colors[0],
    }));
  }

  async findAll(userId: string) {
    return this.list(userId);
  }

  async add(userId: string, dto: AddWishlistItemDto) {
    const existing = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId: dto.productId } },
    });
    if (!existing) {
      await this.prisma.wishlistItem.create({
        data: { userId, productId: dto.productId },
      });
    }
    return this.list(userId);
  }

  async remove(userId: string, productId: string) {
    await this.prisma.wishlistItem.deleteMany({ where: { userId, productId } });
    return this.list(userId);
  }
}
