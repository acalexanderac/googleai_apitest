import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { InfluencersModule } from './influencers/influencers.module';
import { AppConfigModule } from './config/config.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot('mongodb://admin:password123@localhost:27017/health-claims?authSource=admin'),
    AppConfigModule,
    InfluencersModule,
  ],
})
export class AppModule {}
