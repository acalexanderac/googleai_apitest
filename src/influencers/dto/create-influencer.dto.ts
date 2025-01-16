import { IsString, IsArray, IsObject, IsNumber, IsBoolean, IsOptional, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AnalysisMetricsDto {
  @IsNumber()
  @IsOptional()
  trustScore?: number;

  @IsNumber()
  @IsOptional()
  claimsAnalyzed?: number;

  @IsNumber()
  @IsOptional()
  verifiedClaims?: number;

  @IsNumber()
  @IsOptional()
  questionableClaims?: number;

  @IsNumber()
  @IsOptional()
  debunkedClaims?: number;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  lastAnalysis?: Date;
}

export class CreateInfluencerDto {
  @ApiProperty({ description: 'Nombre del influencer' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Título académico o profesional' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Especialidades o áreas de expertise' })
  @IsArray()
  @IsOptional()
  specialties?: string[];

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  credentials?: {
    education: string[];
    certifications: string[];
    institutions: string[];
  };

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  socialMetrics?: {
    followers: {
      twitter: number;
      instagram: number;
      youtube: number;
    };
    engagement: number;
    reach: number;
  };

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  contentSources?: {
    podcast: string;
    blog: string;
    youtube: string;
    twitter: string;
    instagram: string;
  };

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  @Type(() => AnalysisMetricsDto)
  analysisMetrics?: AnalysisMetricsDto;
} 