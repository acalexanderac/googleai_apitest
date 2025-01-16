import { Controller, Get } from '@nestjs/common';
import { InfluencersService } from '../influencers.service';

@Controller('influencer-utils')
export class InfluencerUtilsController {
  constructor(private readonly influencersService: InfluencersService) {}

  @Get('sources')
  getSources() {
    return this.influencersService.getSources();
  }

  @Get('platforms')
  getPlatforms() {
    return this.influencersService.getPlatforms();
  }

  @Get('categories')
  getCategories() {
    return this.influencersService.getCategories();
  }
} 