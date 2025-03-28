import { EventStatus, EventType } from '../entities/event.entity';
import { CommunityCategory } from '../../../types/enums';

/**
 * Represents location query parameters for proximity search
 */
export interface LocationQueryParams {
  lat: number;
  lng: number;
  distance: number;
}

/**
 * DTO for event discovery options
 */
export class EventDiscoveryOptionsDto {
  /**
   * Filter by event status (default: PUBLISHED)
   */
  status?: EventStatus;
  
  /**
   * Filter by event type (IN_PERSON, ONLINE, HYBRID)
   */
  type?: EventType;
  
  /**
   * Filter by community category
   */
  category?: CommunityCategory;
  
  /**
   * Filter by event tags
   */
  tags?: string[];
  
  /**
   * Only show upcoming events (default: true)
   */
  upcoming?: boolean;
  
  /**
   * Filter events starting on or after this date
   */
  startDate?: Date;
  
  /**
   * Filter events starting on or before this date
   */
  endDate?: Date;
  
  /**
   * Max number of events to return (default: 10)
   */
  limit?: number;
  
  /**
   * Page number for pagination (default: 1)
   */
  page?: number;
  
  /**
   * Search term to filter events by title or description
   */
  search?: string;
  
  /**
   * Sort order (date, popularity, distance, relevance)
   */
  sort?: string;
  
  /**
   * Location parameters for proximity search
   */
  location?: LocationQueryParams;
  
  /**
   * Only show events user is attending (default: false)
   */
  isAttending?: boolean;
  
  /**
   * Only show events from communities user is a member of (default: false)
   */
  myCommunitiesOnly?: boolean;
  
  /**
   * Use personalized relevance ranking (default: true)
   */
  useRelevanceRanking?: boolean;
}
