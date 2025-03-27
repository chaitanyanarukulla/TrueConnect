/**
 * TrueConnect Database Seed Script
 * 
 * This script populates the SQLite database with test data including 50 users,
 * communities, relationships, messages, and more.
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Database configuration
const dbPath = path.join(__dirname, 'backend', 'trueconnect.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Profile picture paths
const profilePictures = [
  'amna3.png',
  'batcat.png',
  'Designer (1).png',
  'Designer (2).png',
  'Designer (3).png',
  'Designer (4).png',
  'Designer (5).png',
  'Designer (6).png',
  'Designer (7).png',
  'Designer (8).png',
  'Designer (9).png',
  'Designer (10).png',
  'Designer (11).png',
  'Designer.png',
  'Dog1.png',
  'dog2.png',
];

// Possible values for user fields
const cities = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 
  'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA',
  'Dallas, TX', 'San Jose, CA', 'Austin, TX', 'Jacksonville, FL',
  'Fort Worth, TX', 'Columbus, OH', 'San Francisco, CA', 'Charlotte, NC'
];

const interests = [
  'Hiking', 'Reading', 'Travel', 'Cooking', 'Photography', 'Art', 'Music',
  'Fitness', 'Dancing', 'Gaming', 'Movies', 'Technology', 'Science', 
  'Fashion', 'Sports', 'Yoga', 'Meditation', 'Writing', 'Languages',
  'Volunteering', 'Food', 'Wine', 'Coffee', 'Pets', 'Gardening',
  'History', 'Politics', 'Philosophy', 'Theater', 'Bowling'
];

const genders = ['Male', 'Female', 'Non-binary', 'Other'];
const lookingFor = ['Relationship', 'Friendship', 'Casual', 'Networking'];
const occupations = [
  'Software Engineer', 'Doctor', 'Teacher', 'Lawyer', 'Artist',
  'Chef', 'Writer', 'Designer', 'Manager', 'Scientist', 'Student',
  'Entrepreneur', 'Marketing', 'Sales', 'Consultant', 'Engineer'
];

const education = [
  'High School', 'Associate Degree', 'Bachelor\'s Degree',
  'Master\'s Degree', 'PhD', 'Self-taught', 'Vocational Training'
];

const communityCategories = [
  'hobbies', 'sports', 'arts', 'technology', 'lifestyle', 
  'health', 'education', 'travel', 'food', 'music', 'gaming', 
  'professional', 'local', 'support', 'relationships'
];

const communityNames = [
  'Photography Enthusiasts', 'Hiking Adventures', 'Coding Masters',
  'Book Lovers Club', 'Fitness Fanatics', 'Music Appreciation',
  'Foodies Unite', 'Travel Stories', 'Tech Innovators',
  'Art Appreciation', 'Gaming Community', 'Mental Health Support',
  'Career Networking', 'Language Exchange', 'Movie Buffs'
];

const communityDescriptions = [
  'A community for sharing photography tips, techniques, and amazing shots',
  'Connect with fellow hikers and discover new trails and adventures',
  'Learn and discuss the latest coding practices and technologies',
  'Discuss your favorite books and authors with like-minded readers',
  'Share workout tips, nutritional advice, and stay motivated together',
  'Explore and discuss all genres of music with passionate fans',
  'Discover new recipes, restaurants, and culinary experiences',
  'Share travel experiences, recommendations, and plans',
  'Discuss the latest technological innovations and future trends',
  'Appreciate and analyze art from all periods and styles',
  'Connect with fellow gamers for discussions and multiplayer sessions',
  'A supportive space for discussing mental health issues and support',
  'Expand your professional network and discover opportunities',
  'Practice new languages and connect with native speakers',
  'Review and discuss movies, directors, and cinematic techniques'
];

/**
 * Promisify db.run
 */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('Error running query:', sql);
        console.error('Error:', err);
        return reject(err);
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

/**
 * Promisify db.all
 */
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Error running query:', sql);
        console.error('Error:', err);
        return reject(err);
      }
      resolve(rows);
    });
  });
}

/**
 * Promisify db.get for a single row
 */
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('Error running query:', sql);
        console.error('Error:', err);
        return reject(err);
      }
      resolve(row);
    });
  });
}

/**
 * Utility function to hash passwords
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Get random element from array
 */
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get random elements from array
 */
function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Get random date within range
 */
function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Main function to seed the database
 */
async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Begin transaction
    await run('BEGIN TRANSACTION');

    // Create 50 users
    console.log('Creating users...');
    const users = [];
    const userIds = [];
    const userEmails = [];

    // Create an admin user first
    const adminPassword = await hashPassword('admin123');
    const adminUser = {
      id: uuidv4(),
      name: 'Admin User',
      email: 'admin@trueconnect.com',
      password: adminPassword,
      birthdate: new Date('1990-01-01').toISOString(),
      gender: 'Other',
      location: 'San Francisco, CA',
      bio: 'TrueConnect administrator and product owner',
      profilePicture: '/profiles/Designer (1).png',
      interests: JSON.stringify(['Technology', 'Management', 'Design']),
      preferences: JSON.stringify({
        ageRange: { min: 21, max: 45 },
        distance: 50,
        genderPreferences: ['Male', 'Female', 'Non-binary']
      }),
      socialMedia: JSON.stringify({
        instagram: 'admin_trueconnect',
        twitter: 'admin_tc',
        linkedin: 'admintrueconnect'
      }),
      lookingFor: 'Networking',
      occupation: 'Product Manager',
      education: 'Master\'s Degree',
      privacySettings: JSON.stringify({
        showLocation: true,
        showAge: true,
        showLastActive: true,
        showOnlineStatus: true
      }),
      isVerified: true,
      isPremium: true,
      isActive: true,
      role: 'admin',
      acceptedTerms: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    users.push(adminUser);
    userIds.push(adminUser.id);
    userEmails.push(adminUser.email);

    // Create regular users
    for (let i = 0; i < 49; i++) {
      const gender = getRandomElement(genders);
      const birthYear = 1980 + Math.floor(Math.random() * 25); // 1980 to 2004
      const birthMonth = 1 + Math.floor(Math.random() * 12);
      const birthDay = 1 + Math.floor(Math.random() * 28);
      
      const userInterests = getRandomElements(interests, 3 + Math.floor(Math.random() * 5));
      const genderPrefs = getRandomElements(genders, 1 + Math.floor(Math.random() * 3));
      
      const hashedPassword = await hashPassword('password123');
      const userId = uuidv4();
      const userEmail = `user${i+1}@example.com`;
      
      const user = {
        id: userId,
        name: `User ${i+1}`,
        email: userEmail,
        password: hashedPassword,
        birthdate: new Date(birthYear, birthMonth - 1, birthDay).toISOString(),
        gender: gender,
        location: getRandomElement(cities),
        bio: `Hi, I'm User ${i+1}. I enjoy ${userInterests.slice(0, 2).join(' and ')}.`,
        profilePicture: `/profiles/${getRandomElement(profilePictures)}`,
        interests: JSON.stringify(userInterests),
        preferences: JSON.stringify({
          ageRange: { min: 21, max: 45 },
          distance: 25 + Math.floor(Math.random() * 75),
          genderPreferences: genderPrefs
        }),
        socialMedia: JSON.stringify({
          instagram: `user${i+1}`,
          twitter: `user${i+1}`,
        }),
        lookingFor: getRandomElement(lookingFor),
        occupation: getRandomElement(occupations),
        education: getRandomElement(education),
        privacySettings: JSON.stringify({
          showLocation: Math.random() > 0.3,
          showAge: Math.random() > 0.2,
          showLastActive: Math.random() > 0.5,
          showOnlineStatus: Math.random() > 0.4
        }),
        isVerified: Math.random() > 0.3,
        isPremium: Math.random() > 0.7,
        isActive: true,
        role: 'user',
        acceptedTerms: true,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      users.push(user);
      userIds.push(userId);
      userEmails.push(userEmail);
    }

    // Insert users
    for (const user of users) {
      await run(
        `INSERT INTO users (
          id, name, email, password, birthdate, gender, location, bio, 
          profilePicture, interests, preferences, socialMedia, lookingFor, 
          occupation, education, privacySettings, isVerified, isPremium, 
          isActive, role, acceptedTerms, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id, user.name, user.email, user.password,
          user.birthdate, user.gender, user.location, user.bio,
          user.profilePicture, user.interests, user.preferences,
          user.socialMedia, user.lookingFor, user.occupation,
          user.education, user.privacySettings, user.isVerified,
          user.isPremium, user.isActive, user.role, user.acceptedTerms,
          user.createdAt, user.updatedAt
        ]
      );
    }
    console.log(`Created ${users.length} users`);

    // Create communities
    console.log('Creating communities...');
    const communities = [];
    const communityIds = [];

    for (let i = 0; i < communityNames.length; i++) {
      const creatorIndex = Math.floor(Math.random() * users.length);
      const communityId = uuidv4();
      const creatorId = users[creatorIndex].id;
      
      const community = {
        id: communityId,
        name: communityNames[i],
        description: communityDescriptions[i],
        imageUrl: `/communities/${getRandomElement(profilePictures)}`,
        coverImageUrl: `/communities/cover/${getRandomElement(profilePictures)}`,
        creatorId: creatorId,
        isActive: true,
        isPrivate: Math.random() > 0.7,
        category: getRandomElement(communityCategories),
        settings: JSON.stringify({
          allowMemberPosts: true,
          requirePostApproval: Math.random() > 0.8,
          showInDiscovery: true
        }),
        tags: JSON.stringify(getRandomElements(interests, 3 + Math.floor(Math.random() * 3))),
        memberCount: 0, // Will be updated as members are added
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      communities.push(community);
      communityIds.push(communityId);
    }

    // Insert communities
    for (const community of communities) {
      await run(
        `INSERT INTO communities (
          id, name, description, imageUrl, coverImageUrl, creatorId,
          isActive, isPrivate, category, settings, tags, memberCount,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          community.id, community.name, community.description, 
          community.imageUrl, community.coverImageUrl, community.creatorId,
          community.isActive, community.isPrivate, community.category,
          community.settings, community.tags, community.memberCount,
          community.createdAt, community.updatedAt
        ]
      );
    }
    console.log(`Created ${communities.length} communities`);

    // Create community members
    console.log('Creating community members...');
    let membershipCount = 0;
    
    // First add creators as admins
    for (const community of communities) {
      const membership = {
        id: uuidv4(),
        userId: community.creatorId,
        communityId: community.id,
        role: 'admin',
        isActive: true,
        notifications: true,
        joinedAt: community.createdAt,
        updatedAt: community.updatedAt,
        lastVisitedAt: new Date().toISOString(),
        customTitle: 'Founder'
      };
      
      await run(
        `INSERT INTO community_members (
          id, userId, communityId, role, isActive, notifications,
          joinedAt, updatedAt, lastVisitedAt, customTitle
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          membership.id, membership.userId, membership.communityId,
          membership.role, membership.isActive, membership.notifications,
          membership.joinedAt, membership.updatedAt, membership.lastVisitedAt,
          membership.customTitle
        ]
      );
      
      // Update community member count
      await run(
        `UPDATE communities SET memberCount = memberCount + 1 WHERE id = ?`,
        [community.id]
      );
      
      membershipCount++;
    }
    
    // Add random members to communities
    for (const communityId of communityIds) {
      // Add 5-20 random members to each community
      const memberCount = 5 + Math.floor(Math.random() * 15);
      const memberUserIds = getRandomElements(userIds, memberCount);
      
      for (const userId of memberUserIds) {
        // Check if already a member
        const existing = await get(
          `SELECT id FROM community_members WHERE userId = ? AND communityId = ?`,
          [userId, communityId]
        );
        
        if (existing) continue;
        
        const role = Math.random() > 0.9 ? 'moderator' : 'member';
        const joinDate = new Date(Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000));
        
        const membership = {
          id: uuidv4(),
          userId: userId,
          communityId: communityId,
          role: role,
          isActive: true,
          notifications: Math.random() > 0.3,
          joinedAt: joinDate.toISOString(),
          updatedAt: joinDate.toISOString(),
          lastVisitedAt: new Date(joinDate.getTime() + Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
          customTitle: null
        };
        
        await run(
          `INSERT INTO community_members (
            id, userId, communityId, role, isActive, notifications,
            joinedAt, updatedAt, lastVisitedAt, customTitle
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            membership.id, membership.userId, membership.communityId,
            membership.role, membership.isActive, membership.notifications,
            membership.joinedAt, membership.updatedAt, membership.lastVisitedAt,
            membership.customTitle
          ]
        );
        
        // Update community member count
        await run(
          `UPDATE communities SET memberCount = memberCount + 1 WHERE id = ?`,
          [communityId]
        );
        
        membershipCount++;
      }
    }
    console.log(`Created ${membershipCount} community memberships`);

    // Create matches between users
    console.log('Creating matches...');
    let matchCount = 0;
    
    // Create about 100 matches
    for (let i = 0; i < 100; i++) {
      const userIndex1 = Math.floor(Math.random() * users.length);
      let userIndex2 = Math.floor(Math.random() * users.length);
      
      // Make sure users are different
      while (userIndex2 === userIndex1) {
        userIndex2 = Math.floor(Math.random() * users.length);
      }
      
      const userId = users[userIndex1].id;
      const targetUserId = users[userIndex2].id;
      
      // Check if match already exists
      const existingMatch = await get(
        `SELECT id FROM matches WHERE 
         (userId = ? AND targetUserId = ?) OR 
         (userId = ? AND targetUserId = ?)`,
        [userId, targetUserId, targetUserId, userId]
      );
      
      if (existingMatch) continue;
      
      const matchDate = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
      const matchStatus = Math.random() > 0.2 ? 'matched' : 'pending';
      
      const match = {
        id: uuidv4(),
        userId: userId,
        targetUserId: targetUserId,
        status: matchStatus,
        compatibilityScore: {
          overall: Math.random() * 100,
          interests: Math.random() * 100,
          preferences: Math.random() * 100,
          location: Math.random() * 100
        },
        isSuperLike: Math.random() > 0.8,
        isRead: Math.random() > 0.5,
        createdAt: matchDate.toISOString(),
        updatedAt: matchDate.toISOString()
      };
      
      await run(
        `INSERT INTO matches (
          id, userId, targetUserId, status, compatibilityScore, isSuperLike,
          isRead, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          match.id, match.userId, match.targetUserId, match.status,
          JSON.stringify(match.compatibilityScore), match.isSuperLike,
          match.isRead, match.createdAt, match.updatedAt
        ]
      );
      
      matchCount++;
    }
    console.log(`Created ${matchCount} matches`);

    // Create conversations and messages
    console.log('Creating conversations and messages...');
    let conversationCount = 0;
    let messageCount = 0;
    
    // Get matched users
    const matches = await all(
      `SELECT id, userId, targetUserId FROM matches WHERE status = 'matched'`
    );
    
    for (const match of matches) {
      // Create a conversation between matched users
      const conversationDate = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
      const conversation = {
        id: uuidv4(),
        matchId: match.id,
        user1Id: match.userId,
        user2Id: match.targetUserId,
        isActive: true,
        lastMessageAt: conversationDate.toISOString(),
        createdAt: conversationDate.toISOString(),
        updatedAt: conversationDate.toISOString()
      };
      
      await run(
        `INSERT INTO conversations (
          id, matchId, user1Id, user2Id, isActive, lastMessageAt, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          conversation.id, conversation.matchId, conversation.user1Id, conversation.user2Id,
          conversation.isActive, conversation.lastMessageAt, conversation.createdAt, conversation.updatedAt
        ]
      );
      
      conversationCount++;
      
      // Add 1-15 messages to the conversation
      const messagesToAdd = 1 + Math.floor(Math.random() * 15);
      for (let i = 0; i < messagesToAdd; i++) {
        const senderId = Math.random() > 0.5 ? match.userId : match.targetUserId;
        const receiverId = senderId === match.userId ? match.targetUserId : match.userId;
        
        const messageDate = new Date(conversationDate.getTime() + i * Math.floor(Math.random() * 60 * 60 * 1000));
        const message = {
          id: uuidv4(),
          conversationId: conversation.id,
          senderId: senderId,
          content: `Test message ${i+1} in this conversation.`,
          isRead: Math.random() > 0.3,
          readAt: Math.random() > 0.3 ? new Date(messageDate.getTime() + Math.floor(Math.random() * 60 * 60 * 1000)).toISOString() : null,
          createdAt: messageDate.toISOString(),
          updatedAt: messageDate.toISOString()
        };
        
        await run(
          `INSERT INTO messages (
            id, conversationId, senderId, content, isRead, readAt,
            createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            message.id, message.conversationId, message.senderId,
            message.content, message.isRead, message.readAt,
            message.createdAt, message.updatedAt
          ]
        );
        
        messageCount++;
      }
    }
    console.log(`Created ${conversationCount} conversations with ${messageCount} messages`);

    // Commit transaction
    await run('COMMIT');
    
    console.log('Database seeding completed successfully!');
    
  } catch (e) {
    // Roll back transaction in case of error
    await run('ROLLBACK');
    console.error('Error seeding database:', e);
    throw e;
  } finally {
    // Close database connection
    db.close();
  }
}

// Run the script
seedDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error in database seed script:', err);
    process.exit(1);
  });
