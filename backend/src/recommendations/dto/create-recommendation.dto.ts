import { IsString, MinLength } from 'class-validator';

export class CreateRecommendationDto {
  @IsString()
  @MinLength(3)
  description!: string;
}