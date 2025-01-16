import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
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
} 