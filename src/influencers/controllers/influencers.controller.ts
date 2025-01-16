import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { InfluencersService } from '../influencers.service';

@Controller('influencers')
export class InfluencersController {
  constructor(private readonly influencersService: InfluencersService) {}

  // CRUD y búsqueda
  @Post()
  async create(@Body() createInfluencerDto: any) {
    return this.influencersService.create(createInfluencerDto);
  }

  @Get()
  async findAll() {
    return this.influencersService.findAll();
  }

  @Get('search')
  async searchInfluencers(
    @Query('query') query: string,
    @Query('specialty') specialty: string,
    @Query('minTrustScore') minTrustScore: number,
    @Query('minFollowers') minFollowers: number,
    @Query('sortBy') sortBy: string,
    @Query('order') order: 'asc' | 'desc' = 'desc',
  ) {
    return this.influencersService.searchInfluencers({
      query,
      specialty,
      minTrustScore,
      minFollowers,
      sortBy,
      order
    });
  }

  @Get('leaderboard')
  async getLeaderboard(
    @Query('category') category: string,
    @Query('timeframe') timeframe: string,
    @Query('metric') metric: 'trustScore' | 'followers' | 'engagement' = 'trustScore'
  ) {
    return this.influencersService.getLeaderboard(category, timeframe, metric);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.influencersService.findOne(id);
  }

  @Get(':id/analysis')
  async getInfluencerAnalysis(@Param('id') id: string) {
    return this.influencersService.getDetailedAnalysis(id);
  }

  @Get(':id/claims/categories')
  async getClaimsByCategory(@Param('id') id: string) {
    return this.influencersService.getClaimsByCategory(id);
  }

  @Get(':id/social-metrics')
  async getSocialMetrics(
    @Param('id') id: string,
    @Query('timeframe') timeframe: string
  ) {
    return this.influencersService.getSocialMetrics(id, timeframe);
  }

  @Post(':id/analyze')
  async analyzeInfluencer(
    @Param('id') id: string,
    @Body() analysisConfig: any
  ) {
    return this.influencersService.analyzeInfluencer(id, analysisConfig);
  }

  @Post('compare')
  async compareInfluencers(@Body() body: { ids: string[] }) {
    return this.influencersService.compareInfluencers(body.ids);
  }
} 