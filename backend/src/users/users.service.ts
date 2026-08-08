import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueryUserDto } from './dto/query-user.dto';
import { SuspendUserDto } from './dto/suspend-user.dto';

export interface SyncUserDto {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  provider: string;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private isBootstrapAdmin(email: string): boolean {
    const adminEmails = (this.config.get<string>('ADMIN_EMAILS') ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    return adminEmails.includes(email.toLowerCase());
  }

  async syncUser(data: SyncUserDto) {
    const role = this.isBootstrapAdmin(data.email) ? Role.ADMIN : undefined;

    return this.prisma.user.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        email: data.email,
        fullName: data.fullName ?? null,
        avatarUrl: data.avatarUrl ?? null,
        provider: data.provider,
        ...(role ? { role } : {}),
      },
      update: {
        email: data.email,
        fullName: data.fullName ?? null,
        avatarUrl: data.avatarUrl ?? null,
        ...(role ? { role } : {}),
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findAll(query: QueryUserDto) {
    const users = await this.prisma.user.findMany({
      where: query.search
        ? {
            OR: [
              { fullName: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {},
      orderBy: { createdAt: 'desc' },
    });

    const aggregates = await this.prisma.order.groupBy({
      by: ['userId'],
      where: { status: { not: OrderStatus.CANCELLED } },
      _count: { _all: true },
      _sum: { totalCents: true },
    });
    const aggMap = new Map(
      aggregates.map((a) => [
        a.userId,
        { orderCount: a._count._all, totalSpentCents: a._sum.totalCents ?? 0 },
      ]),
    );

    return users.map((u) => ({
      ...u,
      orderCount: aggMap.get(u.id)?.orderCount ?? 0,
      totalSpentCents: aggMap.get(u.id)?.totalSpentCents ?? 0,
    }));
  }

  async suspend(id: string, dto: SuspendUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.update({
      where: { id },
      data: { suspended: dto.suspended },
    });
  }
}
