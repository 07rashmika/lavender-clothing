import { Injectable } from '@nestjs/common';
import { CustomizationStatus, OrderStatus, ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      revenue,
      ordersToday,
      activeProducts,
      pendingCustomizations,
      recentOrders,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        where: { status: { not: OrderStatus.CANCELLED } },
        _sum: { totalCents: true },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      this.prisma.product.count({ where: { status: ProductStatus.ACTIVE } }),
      this.prisma.customization.count({
        where: { status: CustomizationStatus.PENDING_REVIEW },
      }),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          user: { select: { fullName: true, email: true } },
        },
      }),
    ]);

    return {
      totalRevenueCents: revenue._sum.totalCents ?? 0,
      ordersToday,
      activeProducts,
      pendingCustomizations,
      recentOrders,
    };
  }
}
