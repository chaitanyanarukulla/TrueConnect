export enum PostType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  LINK = 'link',
  EVENT = 'event',
  POLL = 'poll'
}

export interface PollOption {
  text: string;
}

export interface CreatePostDto {
  content: string;
  type?: PostType;
  mediaUrls?: string[];
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  linkImageUrl?: string;
  tags?: string[];
  isAnnouncement?: boolean;
  isPinned?: boolean;
  pollOptions?: PollOption[];
  communityId: string;
}
