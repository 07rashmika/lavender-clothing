import { IsString, MinLength } from 'class-validator';

export class RemoveCartItemDto {
  @IsString()
  @MinLength(1)
  color: string;

  @IsString()
  @MinLength(1)
  size: string;
}
