import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { InfluencersController } from './controllers/influencers.controller';
import { InfluencersService } from './influencers.service';
import { Influencer, InfluencerSchema } from './schemas/influencer.schema';
import { ContentAnalyzerService } from '../services/content-analyzer.service';
import { GeminiService } from '../services/gemini.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Influencer.name, schema: InfluencerSchema }
    ])
  ],
  controllers: [InfluencersController],
  providers: [InfluencersService, ContentAnalyzerService, GeminiService]
})
export class InfluencersModule {}
