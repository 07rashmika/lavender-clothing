import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RecommendationsService } from './recommendations.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Post('design')
  @UseGuards(AuthGuard)
  getDesignSuggestions(@Body() dto: CreateRecommendationDto) {
    return this.recommendationsService.getDesignSuggestions(dto.description);
  }
}