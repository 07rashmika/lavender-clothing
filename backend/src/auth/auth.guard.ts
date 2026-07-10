import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface SupabaseUser {
  sub: string;
  email: string;
  role: string;
  user_metadata: Record<string, unknown>;
  app_metadata: Record<string, unknown>;
  dbRole: Role;
  suspended: boolean;
}

declare module 'express' {
  interface Request {
    user?: SupabaseUser;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const supabaseUrl = this.config.get<string>('SUPABASE_URL');
    const supabaseKey = this.config.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new UnauthorizedException('Supabase is not configured on the server');
    }

    // Call Supabase auth REST API directly — avoids SDK WebSocket initialisation
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseKey,
      },
    });

    if (!res.ok) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await res.json() as {
      id: string;
      email: string;
      role: string;
      user_metadata: Record<string, unknown>;
      app_metadata: Record<string, unknown>;
    };

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, suspended: true },
    });

    if (dbUser?.suspended) {
      throw new ForbiddenException('Account suspended');
    }

    request.user = {
      sub: user.id,
      email: user.email,
      role: user.role ?? 'authenticated',
      user_metadata: user.user_metadata ?? {},
      app_metadata: user.app_metadata ?? {},
      dbRole: dbUser?.role ?? Role.CUSTOMER,
      suspended: dbUser?.suspended ?? false,
    };

    return true;
  }

  private extractToken(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
