import { Injectable } from '@nestjs/common';
import { GeminiService } from './gemini.service';

@Injectable()
export class ContentAnalyzerService {
  constructor(private geminiService: GeminiService) {}

  async analyzeInfluencer(name: string) {
    try {
      // 1. Buscar contenido del influencer
      const contentResponse = await this.geminiService.searchInfluencerContent(name);
      const influencerClaims = JSON.parse(contentResponse);

      // 2. Verificar cada claim
      const verifiedClaims = await Promise.all(
        influencerClaims.map(async (claim) => {
          const verificationResponse = await this.geminiService.verifyHealthClaim(claim.statement);
          const verification = JSON.parse(verificationResponse);
          
          return {
            ...claim,
            ...verification,
            dateAnalyzed: new Date().toISOString()
          };
        })
      );

      // 3. Calcular trust score
      const trustScore = this.calculateTrustScore(verifiedClaims);

      // 4. Generar estadísticas
      const stats = this.generateStats(verifiedClaims);

      return {
        name,
        trustScore,
        stats,
        claims: verifiedClaims,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in analyzeInfluencer:', error);
      throw new Error(`Failed to analyze influencer ${name}: ${error.message}`);
    }
  }

  private calculateTrustScore(claims: any[]): number {
    if (!claims.length) return 0;

    const weights = {
      'Verified': 1.0,
      'Questionable': 0.5,
      'Debunked': 0.0,
      'Needs Review': 0.5
    };

    const totalScore = claims.reduce((acc, claim) => {
      const weight = weights[claim.verificationStatus] || 0.5;
      return acc + (claim.confidence * weight);
    }, 0);

    return Math.round(totalScore / claims.length);
  }

  private generateStats(claims: any[]) {
    const statusCount = claims.reduce((acc, claim) => {
      acc[claim.verificationStatus] = (acc[claim.verificationStatus] || 0) + 1;
      return acc;
    }, {});

    const categoryCount = claims.reduce((acc, claim) => {
      acc[claim.category] = (acc[claim.category] || 0) + 1;
      return acc;
    }, {});

    return {
      total: claims.length,
      byStatus: statusCount,
      byCategory: categoryCount,
      averageConfidence: Math.round(
        claims.reduce((acc, claim) => acc + claim.confidence, 0) / claims.length
      )
    };
  }
} 