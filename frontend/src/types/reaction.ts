/**
 * Reaction types that can be used for posts and comments
 */
export enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  LAUGH = 'laugh',
  SURPRISED = 'surprised',
  SAD = 'sad',
  ANGRY = 'angry'
}

/**
 * Reaction interface representing the reaction data structure
 */
export interface Reaction {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
  };
  type: ReactionType;
  createdAt: string;
}

/**
 * Summary of reaction counts and types
 */
export interface ReactionSummary {
  total: number;
  types: Record<ReactionType, number>;
  recentUsers: Array<{
    id: string;
    name: string;
    type: ReactionType;
  }>;
}

/**
 * Complete reaction response from the API
 */
export interface ReactionResponse {
  summary: ReactionSummary;
  reactions: Reaction[];
}
