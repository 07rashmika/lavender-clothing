import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrendsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTrends() {
    const [topColorsRaw, topProductsRaw, topCustomizationColorsRaw, salesTrend] =
      await Promise.all([
        // Most-ordered colors (from actual purchases)
        this.prisma.orderItem.groupBy({
          by: ['color'],
          _sum: { quantity: true },
          where: { color: { not: null } },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 6,
        }),
        // Best-selling products
        this.prisma.orderItem.groupBy({
          by: ['productId'],
          _sum: { quantity: true },
          where: { productId: { not: null } },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 5,
        }),
        // Most-requested colors in custom design requests
        this.prisma.customization.groupBy({
          by: ['color'],
          _count: { color: true },
          orderBy: { _count: { color: 'desc' } },
          take: 6,
        }),
        // Daily order volume + revenue, last 30 days
        this.prisma.order.findMany({
          where: {
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
          select: { createdAt: true, totalCents: true },
        }),
      ]);

    // Attach product names to the top-products list
    const productIds = topProductsRaw
      .map((p) => p.productId)
      .filter((id): id is string => id !== null);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, images: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const topProducts = topProductsRaw.map((p) => ({
      productId: p.productId,
      name: productMap.get(p.productId!)?.name ?? 'Unknown product',
      image: productMap.get(p.productId!)?.images?.[0] ?? null,
      unitsSold: p._sum.quantity ?? 0,
    }));

    const topColors = topColorsRaw.map((c) => ({
      color: c.color,
      unitsSold: c._sum.quantity ?? 0,
    }));

    const topCustomizationColors = topCustomizationColorsRaw.map((c) => ({
      color: c.color,
      requestCount: c._count.color,
    }));

    // Bucket sales by day (JS-side, since it's simpler than raw SQL date_trunc here)
    const dailyMap = new Map<string, { orders: number; revenueCents: number }>();
    for (const order of salesTrend) {
      const day = order.createdAt.toISOString().slice(0, 10);
      const existing = dailyMap.get(day) ?? { orders: 0, revenueCents: 0 };
      existing.orders += 1;
      existing.revenueCents += order.totalCents;
      dailyMap.set(day, existing);
    }
    const salesByDay = Array.from(dailyMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { topProducts, topColors, topCustomizationColors, salesByDay };
  }

  async getPublicTrending() {
  const topProductsRaw = await this.prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    where: { productId: { not: null } },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 8,
  });

  const productIds = topProductsRaw
    .map((p) => p.productId)
    .filter((id): id is string => id !== null);

  if (productIds.length === 0) return [];

  const products = await this.prisma.product.findMany({
    where: { id: { in: productIds }, status: 'ACTIVE' },
  });

  // findMany doesn't preserve input order, so re-sort to match popularity ranking
  const productMap = new Map(products.map((p) => [p.id, p]));
  return productIds
    .map((id) => productMap.get(id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);
}
}
