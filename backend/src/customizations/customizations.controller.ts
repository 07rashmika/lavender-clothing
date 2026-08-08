import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { SupabaseUser } from '../auth/auth.guard';
import { CustomizationsService } from './customizations.service';
import { CreateCustomizationDto } from './dto/create-customization.dto';
import { UpdateCustomizationStatusDto } from './dto/update-customization-status.dto';

@Controller('customizations')
export class CustomizationsController {
  constructor(private readonly customizationsService: CustomizationsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @CurrentUser() user: SupabaseUser,
    @Body() dto: CreateCustomizationDto,
  ) {
    return this.customizationsService.create(user.sub, dto);
  }

  @Get('mine')
  @UseGuards(AuthGuard)
  findMine(@CurrentUser() user: SupabaseUser) {
    return this.customizationsService.findMine(user.sub);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.customizationsService.findAll();
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCustomizationStatusDto,
  ) {
    return this.customizationsService.updateStatus(id, dto);
  }
}
