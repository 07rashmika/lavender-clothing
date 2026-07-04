import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { SupabaseUser } from '../auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sync')
  @UseGuards(AuthGuard)
  async syncUser(@CurrentUser() user: SupabaseUser) {
    const provider = (user.app_metadata?.provider as string) ?? 'email';
    return this.usersService.syncUser({
      id: user.sub,
      email: user.email,
      fullName: user.user_metadata?.full_name as string | undefined,
      avatarUrl: user.user_metadata?.avatar_url as string | undefined,
      provider,
    });
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@CurrentUser() user: SupabaseUser) {
    return this.usersService.findById(user.sub);
  }
}
