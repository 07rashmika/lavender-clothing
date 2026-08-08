import {
  IsBoolean,
  IsInt,
  IsObject,
  MaxLength,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCustomizationDto {
  @IsString()
  @MinLength(1)
  fabric: string;

  @IsString()
  @MinLength(1)
  color: string;

  @IsString()
  @MinLength(1)
  cut: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  customText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  fontStyle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3_000_000)
  designPreview?: string;

  @IsOptional()
  @IsObject()
  designConfig?: Record<string, unknown>;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsBoolean()
  urgent?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  estimatedPriceCents?: number;
}
