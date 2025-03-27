export enum CommunityCategory {
  DATING = 'dating',
  FRIENDSHIP = 'friendship',
  INTEREST = 'interest',
  LOCATION = 'location',
  ACTIVITY = 'activity',
  SUPPORT = 'support',
  OTHER = 'other',
}

export interface CommunitySettings {
  requiresApproval?: boolean;
  postsRequireApproval?: boolean;
  allowEvents?: boolean;
}

export interface CreateCommunityDto {
  name: string;
  description: string;
  imageUrl?: string;
  coverImageUrl?: string;
  isPrivate?: boolean;
  category?: CommunityCategory;
  tags?: string[];
  settings?: CommunitySettings;
}
