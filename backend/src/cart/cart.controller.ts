import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { SupabaseUser } from '../auth/auth.guard';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { RemoveCartItemDto } from './dto/remove-cart-item.dto';

@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  findAll(@CurrentUser() user: SupabaseUser) {
    return this.cartService.findAll(user.sub);
  }

  @Post()
  add(@CurrentUser() user: SupabaseUser, @Body() dto: AddCartItemDto) {
    return this.cartService.add(user.sub, dto);
  }

  @Patch(':productId')
  update(
    @CurrentUser() user: SupabaseUser,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.update(user.sub, productId, dto);
  }

  @Delete(':productId')
  remove(
    @CurrentUser() user: SupabaseUser,
    @Param('productId') productId: string,
    @Query() query: RemoveCartItemDto,
  ) {
    return this.cartService.remove(user.sub, productId, query);
  }

  @Delete()
  clear(@CurrentUser() user: SupabaseUser) {
    return this.cartService.clear(user.sub);
  }
}
