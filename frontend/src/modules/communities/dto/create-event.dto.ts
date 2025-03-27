export enum EventType {
  IN_PERSON = 'in_person',
  ONLINE = 'online',
  HYBRID = 'hybrid'
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export interface CreateEventDto {
  title: string;
  description: string;
  type: EventType;
  startTime: string;
  endTime: string;
  location?: string;
  virtualMeetingUrl?: string;
  imageUrl?: string;
  communityId: string;
  attendeeLimit?: number;
  isPrivate?: boolean;
  tags?: string[];
}
