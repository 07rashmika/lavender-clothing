import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { SupabaseUser } from '../auth/auth.guard';
import { QueryUserDto } from './dto/query-user.dto';
import { SuspendUserDto } from './dto/suspend-user.dto';

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

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findAll(@Query() query: QueryUserDto) {
    return this.usersService.findAll(query);
  }

  @Patch(':id/suspend')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async suspend(@Param('id') id: string, @Body() dto: SuspendUserDto) {
    return this.usersService.suspend(id, dto);
  }
}
