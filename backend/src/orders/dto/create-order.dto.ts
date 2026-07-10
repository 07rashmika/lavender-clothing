import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class OrderItemDto {
  @IsString()
  @MinLength(1)
  productId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  size?: string;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  @MinLength(1)
  shippingFirstName: string;

  @IsString()
  @MinLength(1)
  shippingLastName: string;

  @IsString()
  @MinLength(1)
  shippingAddress: string;

  @IsString()
  @MinLength(1)
  shippingCity: string;

  @IsString()
  @MinLength(1)
  shippingState: string;

  @IsString()
  @MinLength(1)
  shippingZip: string;

  @IsEnum(PaymentMethod)
  payment: PaymentMethod;
}
