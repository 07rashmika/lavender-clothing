import { IsInt, IsString, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCartItemDto {
  @IsString()
  @MinLength(1)
  color: string;

  @IsString()
  @MinLength(1)
  size: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}
