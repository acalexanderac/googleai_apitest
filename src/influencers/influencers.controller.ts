import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  Param, 
  Delete, 
  Put,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { InfluencersService } from './influencers.service';

@Controller('influencers')
export class InfluencersController {
  constructor(private readonly influencersService: InfluencersService) {}

  // Mover las rutas utilitarias al principio
  @Get('utils/sources')
  getSources() {
    return this.influencersService.getSources();
  }

  @Get('utils/platforms')
  getPlatforms() {
    return this.influencersService.getPlatforms();
  }

  @Get('utils/categories')
  getCategories() {
    return this.influencersService.getCategories();
  }

  // Rutas de búsqueda y leaderboard
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

  // CRUD y rutas específicas de influencer
  @Post()
  async create(@Body() createInfluencerDto: any) {
    return this.influencersService.create(createInfluencerDto);
  }

  @Get()
  async findAll() {
    return this.influencersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.influencersService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateInfluencerDto: any) {
    return this.influencersService.update(id, updateInfluencerDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.influencersService.remove(id);
  }

  // Análisis y Estadísticas
  @Post(':id/analyze')
  async analyzeInfluencer(
    @Param('id') id: string,
    @Body() analysisConfig: any
  ) {
    return this.influencersService.analyzeInfluencer(id, analysisConfig);
  }

  @Get(':id/analysis')
  async getInfluencerAnalysis(@Param('id') id: string) {
    return this.influencersService.getDetailedAnalysis(id);
  }

  @Get(':id/timeline')
  async getClaimsTimeline(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('category') category: string
  ) {
    return this.influencersService.getClaimsTimeline(id, {
      startDate,
      endDate,
      category
    });
  }

  // Comparaciones y Rankings
  @Post('compare')
  async compareInfluencers(@Body() influencerIds: string[]) {
    return this.influencersService.compareInfluencers(influencerIds);
  }

  @Get('stats/categories')
  async getCategoryStats() {
    return this.influencersService.getCategoryStats();
  }

  @Get('claims/trending')
  async getTrendingClaims(
    @Query('timeframe') timeframe: string,
    @Query('category') category: string
  ) {
    return this.influencersService.getTrendingClaims(timeframe, category);
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
}