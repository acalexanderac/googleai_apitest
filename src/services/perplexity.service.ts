import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PerplexityService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.perplexity.ai';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('PERPLEXITY_API_KEY');
  }

  async searchInfluencerContent(name: string) {
    const response = await this.query(`
      Find recent health-related content from ${name}. 
      Focus on specific health claims they've made.
      Return as JSON array of claims.
    `);
    return response;
  }

  async verifyHealthClaim(claim: string) {
    const response = await this.query(`
      Analyze this health claim: "${claim}"
      
      Provide:
      1. Verification status (Verified/Questionable/Debunked)
      2. Scientific evidence summary
      3. Confidence score (0-100)
      4. Category (Nutrition/Medicine/Mental Health)
      
      Return as JSON.
    `);
    return response;
  }

  private async query(prompt: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'pplx-7b-online',
          messages: [{
            role: 'user',
            content: prompt
          }],
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Perplexity API Error:', error);
      throw error;
    }
  }
} 