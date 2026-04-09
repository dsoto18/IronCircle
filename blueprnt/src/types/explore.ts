export type ExploreSourceType = 'influencer' | 'club' | 'brand';

export type ExploreContentType = 'post' | 'announcement' | 'challenge' | 'ad';

export type ExploreItem = {
  PK: string;
  SK: string;
  entity: 'EXPLORE_ITEM';
  sourceId: string;
  sourceName: string;
  sourceType: ExploreSourceType;
  isVerified: boolean;
  contentType: ExploreContentType;
  title: string;
  summary: string;
  ctaLabel?: string;
  metadataLabel?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};
