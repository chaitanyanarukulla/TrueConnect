/**
 * Frontend enum types corresponding to backend enums
 * These are used for type-safe code in the frontend application
 */

// Notification types
export enum NotificationType {
  MATCH = 'match',                       // New match
  MESSAGE = 'message',                   // New message
  COMMUNITY_INVITE = 'community_invite', // Invited to a community
  COMMUNITY_JOIN = 'community_join',     // Someone joined your community
  COMMUNITY_POST = 'community_post',     // New post in a community you're in
  COMMUNITY_COMMENT = 'community_comment', // Comment on your post
  EVENT_INVITE = 'event_invite',         // Invited to an event
  EVENT_REMINDER = 'event_reminder',     // Reminder for upcoming event
  EVENT_UPDATE = 'event_update',         // Event was updated
  EVENT_CANCELLED = 'event_cancelled',   // Event was cancelled
  PROFILE_LIKE = 'profile_like',         // Someone liked your profile
  REACTION = 'reaction',                 // Someone reacted to your content
  SYSTEM = 'system',                     // System notification
}

// Notification channels
export enum NotificationChannel {
  IN_APP = 'in_app',     // Display in the application
  EMAIL = 'email',       // Send via email
  PUSH = 'push',         // Send as push notification
  SMS = 'sms',           // Send via SMS
}

// Notification status
export enum NotificationStatus {
  UNREAD = 'unread',     // Notification is unread
  READ = 'read',         // Notification has been read
  ARCHIVED = 'archived', // Notification is archived
}

// Community categories
export enum CommunityCategory {
  DATING = 'dating',
  FRIENDSHIP = 'friendship',
  HOBBIES = 'hobbies',
  SPORTS = 'sports',
  TECHNOLOGY = 'technology',
  ARTS = 'arts',
  MUSIC = 'music',
  FOOD = 'food',
  TRAVEL = 'travel',
  EDUCATION = 'education',
  CAREER = 'career',
  OTHER = 'other'
}

// Community roles
export enum CommunityRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member'
}

// Event types
export enum EventType {
  IN_PERSON = 'in_person',
  ONLINE = 'online',
  HYBRID = 'hybrid'
}

// Event status
export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

// Attendee status
export enum AttendeeStatus {
  GOING = 'going',
  INTERESTED = 'interested',
  NOT_GOING = 'not_going'
}

// Reaction types
export enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  LAUGH = 'laugh',
  WOW = 'wow',
  SAD = 'sad',
  ANGRY = 'angry'
}

// Match status
export enum MatchStatus {
  PENDING = 'pending',
  MATCHED = 'matched',
  REJECTED = 'rejected'
}
