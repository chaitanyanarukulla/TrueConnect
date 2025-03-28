/**
 * Communities Seeding Module
 * 
 * This module is responsible for seeding community data and memberships into the database.
 */

const { run, get, all } = require('./utils/db');
const { 
  generateId, 
  getRandomElement, 
  getRandomElements, 
  getRandomPastDate,
  getRandomBoolean
} = require('./utils/helpers');
const { 
  profilePictures, 
  interests, 
  communityCategories,
  communityNames,
  communityDescriptions
} = require('./data/constants');

/**
 * Create communities in the database
 * @param {object} db - Database connection
 * @param {Array} users - Array of user objects with IDs
 * @param {number} count - Maximum number of communities to create
 * @returns {Promise<Array>} - Array of created community objects with IDs
 */
async function seedCommunities(db, users, count = communityNames.length) {
  console.log('Creating communities...');
  const communities = [];
  const communityIds = [];

  try {
    const actualCount = Math.min(count, communityNames.length);
    
    for (let i = 0; i < actualCount; i++) {
      const creatorIndex = Math.floor(Math.random() * users.length);
      const communityId = generateId();
      const creatorId = users[creatorIndex].id;
      
      const community = {
        id: communityId,
        name: communityNames[i],
        description: communityDescriptions[i],
        imageUrl: null, // Use null to trigger the fallback initials display
        coverImageUrl: null, // Use null to trigger the fallback display
        creatorId: creatorId,
        isActive: true,
        isPrivate: getRandomBoolean(0.3),
        category: getRandomElement(communityCategories),
        settings: JSON.stringify({
          allowMemberPosts: true,
          requirePostApproval: getRandomBoolean(0.2),
          showInDiscovery: true
        }),
        tags: JSON.stringify(getRandomElements(interests, 3 + Math.floor(Math.random() * 3))),
        memberCount: 0, // Will be updated as members are added
        createdAt: getRandomPastDate(1, 90).toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      communities.push(community);
      communityIds.push(communityId);

      // Insert community into the database
      await run(
        db,
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
    return communities;
  } catch (error) {
    console.error('Error creating communities:', error);
    throw error;
  }
}

/**
 * Create community memberships in the database
 * @param {object} db - Database connection
 * @param {Array} communities - Array of community objects with IDs
 * @param {Array} users - Array of user objects with IDs
 * @returns {Promise<number>} - Number of memberships created
 */
async function seedCommunityMemberships(db, communities, users) {
  console.log('Creating community memberships...');
  let membershipCount = 0;

  try {
    // First add creators as admins
    for (const community of communities) {
      const membership = {
        id: generateId(),
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
        db,
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
        db,
        `UPDATE communities SET memberCount = memberCount + 1 WHERE id = ?`,
        [community.id]
      );
      
      membershipCount++;
    }
    
    // Add random members to communities
    for (const community of communities) {
      // Add 5-20 random members to each community
      const memberCount = 5 + Math.floor(Math.random() * 15);
      const userIds = users.map(user => user.id);
      const memberUserIds = getRandomElements(userIds, memberCount);
      
      for (const userId of memberUserIds) {
        // Skip if user is already creator/admin
        if (userId === community.creatorId) continue;
        
        // Check if already a member
        const existing = await get(
          db,
          `SELECT id FROM community_members WHERE userId = ? AND communityId = ?`,
          [userId, community.id]
        );
        
        if (existing) continue;
        
        const role = getRandomBoolean(0.1) ? 'moderator' : 'member';
        const joinDate = getRandomPastDate(1, 60);
        
        const membership = {
          id: generateId(),
          userId: userId,
          communityId: community.id,
          role: role,
          isActive: true,
          notifications: getRandomBoolean(0.7),
          joinedAt: joinDate.toISOString(),
          updatedAt: joinDate.toISOString(),
          lastVisitedAt: new Date(joinDate.getTime() + Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
          customTitle: null
        };
        
        await run(
          db,
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
          db,
          `UPDATE communities SET memberCount = memberCount + 1 WHERE id = ?`,
          [community.id]
        );
        
        membershipCount++;
      }
    }

    console.log(`Created ${membershipCount} community memberships`);
    return membershipCount;
  } catch (error) {
    console.error('Error creating community memberships:', error);
    throw error;
  }
}

module.exports = {
  seedCommunities,
  seedCommunityMemberships
};
