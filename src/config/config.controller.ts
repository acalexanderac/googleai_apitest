import { Controller, Get } from '@nestjs/common';
import { ConfigService } from './config.service';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('sources')
  getSources() {
    return this.configService.getSources();
  }

  @Get('platforms')
  getPlatforms() {
    return this.configService.getPlatforms();
  }

  @Get('categories')
  getCategories() {
    return this.configService.getCategories();
  }
} 