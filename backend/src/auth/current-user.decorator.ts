import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import type { SupabaseUser } from './auth.guard';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SupabaseUser => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as SupabaseUser;
  },
);
