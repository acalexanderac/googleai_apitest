import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Influencer extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  title: string;

  @Prop({ type: [String] })
  specialties: string[];

  @Prop({
    type: {
      education: [String],
      certifications: [String],
      institutions: [String]
    }
  })
  credentials: {
    education: string[];
    certifications: string[];
    institutions: string[];
  };

  @Prop({
    type: {
      followers: {
        twitter: Number,
        instagram: Number,
        youtube: Number
      },
      engagement: Number,
      reach: Number
    }
  })
  socialMetrics: {
    followers: {
      twitter: number;
      instagram: number;
      youtube: number;
    };
    engagement: number;
    reach: number;
  };

  @Prop({
    type: {
      trustScore: Number,
      claimsAnalyzed: Number,
      verifiedClaims: Number,
      questionableClaims: Number,
      debunkedClaims: Number,
      lastAnalysis: Date
    }
  })
  analysisMetrics: {
    trustScore: number;
    claimsAnalyzed: number;
    verifiedClaims: number;
    questionableClaims: number;
    debunkedClaims: number;
    lastAnalysis: Date;
  };

  @Prop({
    type: {
      podcast: String,
      blog: String,
      youtube: String,
      twitter: String,
      instagram: String
    }
  })
  contentSources: {
    podcast: string;
    blog: string;
    youtube: string;
    twitter: string;
    instagram: string;
  };

  @Prop([{
    type: {
      statement: String,
      source: String,
      date: Date,
      category: String,
      verificationStatus: String,
      confidence: Number,
      evidence: String,
      sources: [String]
    }
  }])
  claims: Array<{
    statement: string;
    source: string;
    date: Date;
    category: string;
    verificationStatus: string;
    confidence: number;
    evidence: string;
    sources: string[];
  }>;

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ default: true })
  isActive: boolean;
}

export const InfluencerSchema = SchemaFactory.createForClass(Influencer); 