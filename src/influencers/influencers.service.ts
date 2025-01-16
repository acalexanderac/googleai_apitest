import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Influencer } from './schemas/influencer.schema';
import { ContentAnalyzerService } from '../services/content-analyzer.service';
import { GeminiService } from '../services/gemini.service';

@Injectable()
export class InfluencersService {
  constructor(
    @InjectModel(Influencer.name) private influencerModel: Model<Influencer>,
    private contentAnalyzerService: ContentAnalyzerService,
    private geminiService: GeminiService
  ) {}

  // CRUD Básico
  async create(createInfluencerDto: any) {
    const createdInfluencer = new this.influencerModel(createInfluencerDto);
    return createdInfluencer.save();
  }

  async findAll() {
    return this.influencerModel.find().exec();
  }

  async findOne(id: string) {
    const influencer = await this.influencerModel.findById(id).exec();
    if (!influencer) {
      throw new NotFoundException(`Influencer #${id} not found`);
    }
    return influencer;
  }

  async update(id: string, updateInfluencerDto: any) {
    const updatedInfluencer = await this.influencerModel
      .findByIdAndUpdate(id, updateInfluencerDto, { new: true })
      .exec();
    if (!updatedInfluencer) {
      throw new NotFoundException(`Influencer #${id} not found`);
    }
    return updatedInfluencer;
  }

  async remove(id: string) {
    const deletedInfluencer = await this.influencerModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedInfluencer) {
      throw new NotFoundException(`Influencer #${id} not found`);
    }
    return deletedInfluencer;
  }

  // Búsqueda y Filtrado
  async searchInfluencers(filters: any) {
    const query: any = {};

    if (filters.query) {
      query.$or = [
        { name: new RegExp(filters.query, 'i') },
        { specialties: new RegExp(filters.query, 'i') },
        { tags: new RegExp(filters.query, 'i') }
      ];
    }

    if (filters.specialty) {
      query.specialties = filters.specialty;
    }

    if (filters.minTrustScore) {
      query['analysisMetrics.trustScore'] = { $gte: filters.minTrustScore };
    }

    if (filters.minFollowers) {
      query['socialMetrics.followers.total'] = { $gte: filters.minFollowers };
    }

    const sortOption = {};
    sortOption[filters.sortBy || 'analysisMetrics.trustScore'] = 
      filters.order === 'asc' ? 1 : -1;

    return this.influencerModel
      .find(query)
      .sort(sortOption)
      .limit(20);
  }

  // Análisis y Estadísticas
  async analyzeInfluencer(id: string, config: any) {
    const influencer = await this.findOne(id);
    
    // Obtener contenido reciente
    const content = await this.geminiService.searchInfluencerContent(influencer.name);
    
    // Analizar claims
    const analysis = await this.contentAnalyzerService.analyzeInfluencer(influencer.name);
    
    // Actualizar métricas
    const updatedMetrics = {
      'analysisMetrics.trustScore': analysis.trustScore,
      'analysisMetrics.lastAnalysis': new Date(),
      'analysisMetrics.claimsAnalyzed': analysis.stats.total,
      claims: analysis.claims
    };

    return this.update(id, updatedMetrics);
  }

  async getLeaderboard(category?: string, timeframe?: string, metric: string = 'trustScore') {
    const query: any = { isActive: true };
    
    if (category) {
      query.specialties = category;
    }

    return this.influencerModel
      .aggregate([
        { $match: query },
        {
          $addFields: {
            effectiveTrustScore: {
              $ifNull: ['$analysisMetrics.trustScore', '$trustScore']
            },
            totalFollowers: {
              $sum: [
                { $ifNull: ['$socialMetrics.followers.youtube', 0] },
                { $ifNull: ['$socialMetrics.followers.twitter', 0] },
                { $ifNull: ['$socialMetrics.followers.instagram', 0] },
                { $ifNull: ['$followerCount', 0] }
              ]
            },
            effectiveEngagement: {
              $ifNull: ['$socialMetrics.engagement', 0]
            }
          }
        },
        {
          $sort: metric === 'followers' 
            ? { totalFollowers: -1 }
            : metric === 'engagement'
              ? { effectiveEngagement: -1 }
              : { effectiveTrustScore: -1 }
        },
        { $limit: 20 },
        {
          $project: {
            name: 1,
            title: 1,
            trustScore: '$effectiveTrustScore',
            followers: {
              $cond: {
                if: { $gt: ['$totalFollowers', 0] },
                then: {
                  total: '$totalFollowers',
                  twitter: { $ifNull: ['$socialMetrics.followers.twitter', 0] },
                  instagram: { $ifNull: ['$socialMetrics.followers.instagram', 0] },
                  youtube: { $ifNull: ['$socialMetrics.followers.youtube', 0] }
                },
                else: { total: '$followerCount' }
              }
            },
            engagement: '$effectiveEngagement',
            claims: 1,
            specialties: 1,
            credentials: 1
          }
        }
      ])
      .exec();
  }

  async getDetailedAnalysis(id: string) {
    const influencer = await this.findOne(id);
    return {
      basic: {
        name: influencer.name,
        title: influencer.title,
        specialties: influencer.specialties
      },
      metrics: influencer.analysisMetrics,
      social: influencer.socialMetrics,
      claims: this.groupClaimsByCategory(influencer.claims),
      timeline: this.generateClaimsTimeline(influencer.claims)
    };
  }

  async getClaimsTimeline(id: string, options: any) {
    const influencer = await this.findOne(id);
    let claims = influencer.claims;

    if (options.startDate) {
      claims = claims.filter(claim => 
        new Date(claim.date) >= new Date(options.startDate)
      );
    }

    if (options.endDate) {
      claims = claims.filter(claim => 
        new Date(claim.date) <= new Date(options.endDate)
      );
    }

    if (options.category) {
      claims = claims.filter(claim => 
        claim.category === options.category
      );
    }

    return this.generateClaimsTimeline(claims);
  }

  // Comparaciones y Rankings
  async compareInfluencers(ids: string[]) {
    const influencers = await this.influencerModel
      .find({ _id: { $in: ids } })
      .select('name title credentials socialMetrics analysisMetrics specialties claims')
      .exec();

    return {
      comparison: influencers.map(inf => ({
        name: inf.name,
        title: inf.title,
        metrics: {
          trustScore: inf.analysisMetrics.trustScore,
          totalFollowers: 
            inf.socialMetrics.followers.twitter + 
            inf.socialMetrics.followers.instagram + 
            inf.socialMetrics.followers.youtube,
          engagement: inf.socialMetrics.engagement,
          claimsAnalyzed: inf.analysisMetrics.claimsAnalyzed,
          verificationRate: inf.analysisMetrics.claimsAnalyzed > 0 
            ? (inf.analysisMetrics.verifiedClaims / inf.analysisMetrics.claimsAnalyzed) * 100 
            : 0
        },
        credentials: {
          education: inf.credentials.education.length,
          certifications: inf.credentials.certifications.length,
          institutions: inf.credentials.institutions.length
        }
      })),
      summary: {
        mostTrusted: influencers.reduce((prev, curr) => 
          prev.analysisMetrics.trustScore > curr.analysisMetrics.trustScore ? prev : curr
        ).name,
        highestEngagement: influencers.reduce((prev, curr) => 
          prev.socialMetrics.engagement > curr.socialMetrics.engagement ? prev : curr
        ).name,
        mostFollowers: influencers.reduce((prev, curr) => {
          const prevTotal = prev.socialMetrics.followers.twitter + 
                           prev.socialMetrics.followers.instagram + 
                           prev.socialMetrics.followers.youtube;
          const currTotal = curr.socialMetrics.followers.twitter + 
                           curr.socialMetrics.followers.instagram + 
                           curr.socialMetrics.followers.youtube;
          return prevTotal > currTotal ? prev : curr;
        }).name
      }
    };
  }

  async getCategoryStats() {
    const influencers = await this.findAll();
    const stats = {};

    influencers.forEach(inf => {
      inf.claims.forEach(claim => {
        if (!stats[claim.category]) {
          stats[claim.category] = {
            total: 0,
            verified: 0,
            questionable: 0,
            debunked: 0
          };
        }
        stats[claim.category].total++;
        stats[claim.category][claim.verificationStatus.toLowerCase()]++;
      });
    });

    return stats;
  }

  async getTrendingClaims(timeframe: string, category: string) {
    const query: any = {};
    
    if (category) {
      query['claims.category'] = category;
    }

    if (timeframe) {
      const date = new Date();
      date.setDate(date.getDate() - parseInt(timeframe));
      query['claims.date'] = { $gte: date };
    }

    const influencers = await this.influencerModel
      .find(query)
      .select('claims');

    const allClaims = influencers.flatMap(inf => inf.claims);
    return this.sortClaimsByEngagement(allClaims).slice(0, 10);
  }

  // Utilidades
  getSources(): string[] {
    return [
      'PubMed',
      'Nature',
      'The Lancet',
      'JAMA',
      'New England Journal of Medicine',
      'Science Direct',
      'Cochrane Library',
      'BMJ',
      'Cell',
      'WHO Guidelines'
    ];
  }

  getPlatforms(): string[] {
    return [
      'Twitter',
      'Instagram',
      'YouTube',
      'Podcasts',
      'Blog Posts',
      'Scientific Publications',
      'TikTok',
      'LinkedIn',
      'Facebook',
      'Newsletters'
    ];
  }

  getCategories(): string[] {
    return [
      'Nutrition',
      'Exercise Science',
      'Mental Health',
      'Sleep Science',
      'Longevity',
      'Supplements',
      'Weight Management',
      'Hormones',
      'Gut Health',
      'Immunology',
      'Neuroscience',
      'Cardiovascular Health'
    ];
  }

  // Métodos Privados de Utilidad
  private getMetricSortField(metric: string): string {
    const metricMap = {
      trustScore: 'analysisMetrics.trustScore',
      followers: 'socialMetrics.followers.youtube',
      engagement: 'socialMetrics.engagement'
    };
    return metricMap[metric] || metricMap.trustScore;
  }

  private groupClaimsByCategory(claims: any[]) {
    return claims.reduce((acc, claim) => {
      if (!acc[claim.category]) {
        acc[claim.category] = [];
      }
      acc[claim.category].push(claim);
      return acc;
    }, {});
  }

  private generateClaimsTimeline(claims: any[]) {
    const timeline = claims
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(claim => ({
        date: claim.date,
        statement: claim.statement,
        status: claim.verificationStatus,
        confidence: claim.confidence
      }));

    return timeline;
  }

  private getClaimsBreakdown(claims: any[]) {
    return {
      total: claims.length,
      verified: claims.filter(c => c.verificationStatus === 'Verified').length,
      questionable: claims.filter(c => c.verificationStatus === 'Questionable').length,
      debunked: claims.filter(c => c.verificationStatus === 'Debunked').length
    };
  }

  private sortClaimsByEngagement(claims: any[]) {
    return claims.sort((a, b) => 
      (b.engagement?.total || 0) - (a.engagement?.total || 0)
    );
  }

  async getClaimsByCategory(id: string) {
    const influencer = await this.findOne(id);
    const claimsByCategory = influencer.claims.reduce((acc, claim) => {
      if (!acc[claim.category]) {
        acc[claim.category] = {
          total: 0,
          claims: [],
          verificationBreakdown: {
            Verified: 0,
            Questionable: 0,
            Debunked: 0
          }
        };
      }
      
      acc[claim.category].total++;
      acc[claim.category].claims.push(claim);
      acc[claim.category].verificationBreakdown[claim.verificationStatus]++;
      
      return acc;
    }, {});

    return Object.entries(claimsByCategory).map(([category, data]: [string, any]) => ({
      category,
      total: data.total,
      claims: data.claims,
      verificationBreakdown: data.verificationBreakdown,
      confidenceAverage: data.claims.reduce((sum, claim) => sum + claim.confidence, 0) / data.total
    }));
  }

  async getSocialMetrics(id: string, timeframe: string) {
    const influencer = await this.findOne(id);
    
    // Convertir timeframe a días
    const days = timeframe ? parseInt(timeframe) : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Filtrar claims por fecha
    const recentClaims = influencer.claims.filter(claim => 
      new Date(claim.date) >= startDate
    );

    return {
      followers: influencer.socialMetrics.followers,
      engagement: influencer.socialMetrics.engagement,
      reach: influencer.socialMetrics.reach,
      recentActivity: {
        totalClaims: recentClaims.length,
        verificationBreakdown: this.getClaimsBreakdown(recentClaims),
        topCategories: this.getTopCategories(recentClaims),
        averageConfidence: recentClaims.reduce((sum, claim) => 
          sum + claim.confidence, 0) / (recentClaims.length || 1)
      },
      platforms: Object.entries(influencer.contentSources).map(([platform, url]) => ({
        platform,
        url,
        active: !!url
      }))
    };
  }

  private getTopCategories(claims: any[]) {
    const categoryCount = claims.reduce((acc, claim) => {
      acc[claim.category] = (acc[claim.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categoryCount)
      .sort(([,a]: any, [,b]: any) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({
        category,
        count,
        percentage: (count as number / claims.length) * 100
      }));
  }
}