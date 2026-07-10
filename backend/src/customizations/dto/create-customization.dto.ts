import {
  IsBoolean,
  IsInt,
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
  @IsBoolean()
  urgent?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  estimatedPriceCents?: number;
}
