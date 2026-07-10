import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  storeName?: string;

  @IsOptional()
  @IsString()
  storeEmail?: string;

  @IsOptional()
  @IsString()
  storePhone?: string;

  @IsOptional()
  @IsString()
  storeAddress?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  shippingFeeCents?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  codFeeCents?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  taxRateBps?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  freeShipThresholdCents?: number;

  @IsOptional()
  @IsBoolean()
  notifyNewOrder?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyCustomRequest?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyLowStock?: boolean;
}
