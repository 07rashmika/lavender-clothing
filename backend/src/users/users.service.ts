import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SyncUserDto {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  provider: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async syncUser(data: SyncUserDto) {
    return this.prisma.user.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        email: data.email,
        fullName: data.fullName ?? null,
        avatarUrl: data.avatarUrl ?? null,
        provider: data.provider,
      },
      update: {
        email: data.email,
        fullName: data.fullName ?? null,
        avatarUrl: data.avatarUrl ?? null,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
