export class AnalyzeInfluencerDto {
  name: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  claimLimit?: number;
} 