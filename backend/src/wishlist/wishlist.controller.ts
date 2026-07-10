import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { SupabaseUser } from '../auth/auth.guard';
import { WishlistService } from './wishlist.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';

@Controller('wishlist')
@UseGuards(AuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  findAll(@CurrentUser() user: SupabaseUser) {
    return this.wishlistService.findAll(user.sub);
  }

  @Post()
  add(@CurrentUser() user: SupabaseUser, @Body() dto: AddWishlistItemDto) {
    return this.wishlistService.add(user.sub, dto);
  }

  @Delete(':productId')
  remove(@CurrentUser() user: SupabaseUser, @Param('productId') productId: string) {
    return this.wishlistService.remove(user.sub, productId);
  }
}
