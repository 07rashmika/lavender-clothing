import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { CurrentUser } from './auth/current-user.decorator';
import type { SupabaseUser } from './auth/auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Example protected route — add @UseGuards(AuthGuard) to any route that requires auth
  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@CurrentUser() user: SupabaseUser) {
    return { id: user.sub, email: user.email, metadata: user.user_metadata };
  }
}
