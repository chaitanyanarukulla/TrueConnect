/**
 * Global enum types used across the application
 */

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

export enum CommunityRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member'
}

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

export enum AttendeeStatus {
  GOING = 'going',
  INTERESTED = 'interested',
  NOT_GOING = 'not_going'
}

export enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  LAUGH = 'laugh',
  WOW = 'wow',
  SAD = 'sad',
  ANGRY = 'angry'
}

export enum MatchStatus {
  PENDING = 'pending',
  MATCHED = 'matched',
  REJECTED = 'rejected'
}

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

export enum NotificationChannel {
  IN_APP = 'in_app',     // Display in the application
  EMAIL = 'email',       // Send via email
  PUSH = 'push',         // Send as push notification
  SMS = 'sms',           // Send via SMS
}

export enum NotificationStatus {
  UNREAD = 'unread',     // Notification is unread
  READ = 'read',         // Notification has been read
  ARCHIVED = 'archived', // Notification is archived
}

export enum ReportType {
  USER = 'user',               // Report about a user
  POST = 'post',               // Report about a post
  COMMENT = 'comment',         // Report about a comment
  MESSAGE = 'message',         // Report about a message
  COMMUNITY = 'community',     // Report about a community
  EVENT = 'event',             // Report about an event
}

export enum ReportReason {
  INAPPROPRIATE = 'inappropriate',       // Inappropriate content
  HARASSMENT = 'harassment',             // Harassment or bullying
  SPAM = 'spam',                         // Spam content
  FAKE_PROFILE = 'fake_profile',         // Fake profile
  OFFENSIVE = 'offensive',               // Offensive content
  HATE_SPEECH = 'hate_speech',           // Hate speech
  VIOLENCE = 'violence',                 // Violence or threats
  ILLEGAL = 'illegal',                   // Illegal content
  COPYRIGHT = 'copyright',               // Copyright infringement
  OTHER = 'other',                       // Other reason
}

export enum ReportStatus {
  PENDING = 'pending',           // Report is pending review
  REVIEWING = 'reviewing',       // Report is being reviewed
  RESOLVED = 'resolved',         // Report has been resolved
  REJECTED = 'rejected',         // Report has been rejected
}

export enum ModerationAction {
  WARNING = 'warning',           // Warning issued to user
  CONTENT_REMOVED = 'content_removed', // Content removed
  TEMPORARY_BAN = 'temporary_ban',     // User temporarily banned
  PERMANENT_BAN = 'permanent_ban',     // User permanently banned
  NO_ACTION = 'no_action',             // No action taken
}

export enum ContentStatus {
  PENDING_REVIEW = 'pending_review',   // Content is pending review
  APPROVED = 'approved',               // Content is approved
  REJECTED = 'rejected',               // Content is rejected
  FLAGGED = 'flagged',                 // Content is flagged for review
}
