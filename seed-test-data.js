/**
 * TrueConnect Test Data Seeding Script
 * 
 * This script populates the SQLite database with test data for user testing scenarios.
 * Run this script before beginning user testing to ensure a consistent starting point.
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Database configuration
const db = new sqlite3.Database(path.join(__dirname, 'backend', 'trueconnect.sqlite'), (err) => {
  if (err) {
    console.error('Could not connect to database', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

/**
 * Utility function to hash passwords
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

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
 * Main seeding function
 */
async function seedTestData() {
  try {
    // Begin transaction
    await run('BEGIN TRANSACTION');
    
    console.log('Starting test data seeding...');
    
    // Clear existing test data
    await clearTestData();
    
    // Create test users
    const users = await createTestUsers();
    console.log(`Created ${users.length} test users`);
    
    // Create test communities
    const communities = await createTestCommunities(users);
    console.log(`Created ${communities.length} test communities`);
    
    // Add users to communities
    await addUsersToCommunities(users, communities);
    console.log('Added users to communities');
    
    // Create test posts and comments
    const posts = await createTestPosts(users, communities);
    console.log(`Created ${posts.length} test posts`);
    
    // Create test reactions
    await createTestReactions(users, posts);
    console.log('Added reactions to posts');
    
    // Create test events
    await createTestEvents(users, communities);
    console.log('Created test events');
    
    // Create test matches between users
    await createTestMatches(users);
    console.log('Created test matches');
    
    // Create test conversations and messages
    await createTestConversations(users);
    console.log('Created test conversations with messages');
    
    // Commit transaction
    await run('COMMIT');
    
    console.log('Test data seeding completed successfully!');
    
  } catch (e) {
    // Roll back transaction in case of error
    await run('ROLLBACK');
    console.error('Error seeding test data:', e);
    throw e;
  } finally {
    // Close database connection
    db.close();
  }
}

/**
 * Clear existing test data
 */
async function clearTestData() {
  const tables = [
    'message', 'conversation', 'match', 'event_attendee', 'event', 
    'comment_reaction', 'post_reaction', 'comment', 'post', 
    'community_member', 'community', 'profile', 'user'
  ];
  
  for (const table of tables) {
    await run(`DELETE FROM "${table}" WHERE id LIKE 'test-%'`);
  }
  
  console.log('Cleared existing test data');
}

/**
 * Create test users
 */
async function createTestUsers() {
  const users = [
    {
      id: 'test-user-1',
      email: 'tester1@example.com',
      password: await hashPassword('Test123!'),
      name: 'Test User 1',
      gender: 'female',
      birthDate: '1997-05-15',
      interests: ['hiking', 'photography', 'travel'],
    },
    {
      id: 'test-user-2',
      email: 'tester2@example.com',
      password: await hashPassword('Test123!'),
      name: 'Test User 2',
      gender: 'male',
      birthDate: '1995-08-20',
      interests: ['hiking', 'music', 'technology'],
    },
    {
      id: 'test-user-3',
      email: 'tester3@example.com',
      password: await hashPassword('Test123!'),
      name: 'Test User 3',
      gender: 'non-binary',
      birthDate: '1999-03-10',
      interests: ['gaming', 'technology', 'art'],
    },
    {
      id: 'test-user-4',
      email: 'tester4@example.com',
      password: await hashPassword('Test123!'),
      name: 'Test User 4',
      gender: 'female',
      birthDate: '1996-11-25',
      interests: ['reading', 'cooking', 'fitness'],
    },
    {
      id: 'test-user-5',
      email: 'tester5@example.com',
      password: await hashPassword('Test123!'),
      name: 'Test User 5',
      gender: 'male',
      birthDate: '1994-07-12',
      interests: ['travel', 'photography', 'music'],
    },
  ];
  
  for (const user of users) {
    // Insert user
    await run(
      'INSERT INTO "users" (id, email, password, name, birthdate, gender, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
      [user.id, user.email, user.password, user.name, user.birthDate, user.gender]
    );
    
    // Calculate age from birthDate
    const birthDate = new Date(user.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // We don't need to insert profile separately since it's all in the users table now
  }
  
  return users;
}

/**
 * Create test communities
 */
async function createTestCommunities(users) {
  const communities = [
    {
      id: 'test-community-1',
      name: 'Tech Enthusiasts',
      description: 'A group for technology lovers to connect and share innovations.',
      creatorId: users[0].id,
      tags: JSON.stringify(['Technology', 'Innovation', 'Gadgets']),
    },
    {
      id: 'test-community-2',
      name: 'Outdoor Adventures',
      description: 'Connect with fellow outdoor enthusiasts for hikes, camping, and adventures.',
      creatorId: users[1].id,
      tags: JSON.stringify(['Hiking', 'Camping', 'Nature']),
    },
    {
      id: 'test-community-3',
      name: 'Foodies Unite',
      description: 'Share recipes, restaurant recommendations, and cooking tips.',
      creatorId: users[2].id,
      tags: JSON.stringify(['Cooking', 'Restaurants', 'Food']),
    },
  ];
  
  for (const community of communities) {
    await run(
      'INSERT INTO communities (id, name, description, creator_id, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
      [community.id, community.name, community.description, community.creatorId, community.tags]
    );
  }
  
  return communities;
}

/**
 * Add users to communities
 */
async function addUsersToCommunities(users, communities) {
  // Make all users members of all communities for testing simplicity
  for (const user of users) {
    for (const community of communities) {
      const isCreator = community.creatorId === user.id;
      await run(
        'INSERT INTO community_members (id, community_id, user_id, role, created_at, updated_at) VALUES (?, ?, ?, ?, datetime("now"), datetime("now"))',
        [uuidv4(), community.id, user.id, isCreator ? 'admin' : 'member']
      );
    }
  }
}

/**
 * Create test posts
 */
async function createTestPosts(users, communities) {
  const posts = [];
  const postTypes = ['text', 'image', 'link', 'poll'];
  
  // Create several posts for each community
  for (const community of communities) {
    for (let i = 0; i < 3; i++) {
      for (const user of users.slice(0, 3)) { // First 3 users create posts
        const postId = `test-post-${community.id}-${user.id}-${i}`;
        const postType = postTypes[Math.floor(Math.random() * postTypes.length)];
        const post = {
          id: postId,
          communityId: community.id,
          authorId: user.id,
          type: postType,
          content: `This is a test ${postType} post created by ${user.name} in the ${community.name} community.`,
          isPinned: i === 0 && user.id === community.creatorId, // Pin the first post by the community creator
          isAnnouncement: i === 0 && user.id === community.creatorId, // Make it an announcement too
        };
        
        posts.push(post);
        
        // Insert post
        await run(
          'INSERT INTO posts (id, community_id, author_id, type, content, is_pinned, is_announcement, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
          [post.id, post.communityId, post.authorId, post.type, post.content, post.isPinned ? 1 : 0, post.isAnnouncement ? 1 : 0]
        );
        
        // Create comments for each post
        await createTestComments(post, users);
      }
    }
  }
  
  return posts;
}

/**
 * Create test comments
 */
async function createTestComments(post, users) {
  // Each post gets comments from multiple users
  for (const user of users.slice(0, 4)) { // First 4 users comment
    const commentId = `test-comment-${post.id}-${user.id}`;
    
    await run(
      'INSERT INTO comments (id, post_id, author_id, content, created_at, updated_at) VALUES (?, ?, ?, ?, datetime("now"), datetime("now"))',
      [commentId, post.id, user.id, `Comment from ${user.name} on this post`]
    );
    
    // Add a reply to the first comment by another user
    if (user === users[0]) {
      const replyUser = users[1];
      const replyId = `test-reply-${commentId}-${replyUser.id}`;
      
      await run(
        'INSERT INTO comments (id, post_id, author_id, parent_id, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
        [replyId, post.id, replyUser.id, commentId, `Reply from ${replyUser.name} to ${user.name}'s comment`]
      );
    }
  }
}

/**
 * Create test reactions
 */
async function createTestReactions(users, posts) {
  const reactionTypes = ['like', 'love', 'laugh', 'wow', 'sad', 'angry'];
  
  // Add reactions to posts
  for (const post of posts) {
    for (const user of users) {
      // Not all users react to all posts
      if (Math.random() > 0.3) {
        const reactionType = reactionTypes[Math.floor(Math.random() * reactionTypes.length)];
        
        await run(
          'INSERT INTO post_reactions (id, post_id, user_id, type, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
          [uuidv4(), post.id, user.id, reactionType]
        );
      }
    }
    
    // Get comments for this post to add reactions to them
    const comments = await all('SELECT id FROM comments WHERE post_id = ?', [post.id]);
    
    // Add reactions to comments
    for (const comment of comments) {
      for (const user of users) {
        // Not all users react to all comments
        if (Math.random() > 0.5) {
          const reactionType = reactionTypes[Math.floor(Math.random() * reactionTypes.length)];
          
          await run(
            'INSERT INTO comment_reactions (id, comment_id, user_id, type, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
            [uuidv4(), comment.id, user.id, reactionType]
          );
        }
      }
    }
  }
}

/**
 * Create test events
 */
async function createTestEvents(users, communities) {
  const eventTypes = ['in_person', 'online', 'hybrid'];
  const eventStatuses = ['draft', 'published', 'cancelled', 'completed'];
  
  // Current date for reference
  const now = new Date();
  
  // Create events for each community
  for (const community of communities) {
    for (let i = 0; i < 5; i++) {
      const creatorIndex = i % users.length;
      const creator = users[creatorIndex];
      
      const eventType = eventTypes[i % eventTypes.length];
      
      // Create events with different statuses
      let eventStatus;
      if (i === 0) {
        eventStatus = 'draft'; // First event is a draft
      } else if (i === 1) {
        eventStatus = 'cancelled'; // Second event is cancelled
      } else if (i === 2) {
        eventStatus = 'completed'; // Third event is completed
      } else {
        eventStatus = 'published'; // Rest are published
      }
      
      // Set start and end times
      let startTime, endTime;
      
      if (eventStatus === 'completed') {
        // Completed event in the past
        startTime = new Date(now);
        startTime.setDate(startTime.getDate() - 7);
        endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 2);
      } else if (eventStatus === 'cancelled') {
        // Cancelled event in the future
        startTime = new Date(now);
        startTime.setDate(startTime.getDate() + 14);
        endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 2);
      } else {
        // Other events in the near future
        startTime = new Date(now);
        startTime.setDate(startTime.getDate() + 3 + i * 2); // Spread events out
        endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 2);
      }
      
      const eventId = `test-event-${community.id}-${i}`;
      
      // Format dates for SQLite
      const formatDate = (date) => date.toISOString().replace('T', ' ').substring(0, 19);
      
      // Insert event
      await run(
        `INSERT INTO events (
          id, title, description, type, status, start_time, end_time, 
          location, virtual_meeting_url, image_url, community_id, creator_id, 
          attendee_limit, is_private, tags, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))`,
        [
          eventId,
          `${community.name} ${eventType} Event ${i + 1}`,
          `This is a test ${eventType} event for the ${community.name} community, created by ${creator.name}.`,
          eventType,
          eventStatus,
          formatDate(startTime),
          formatDate(endTime),
          eventType !== 'online' ? 'Test Location, City' : null,
          eventType !== 'in_person' ? 'https://zoom.us/test-meeting' : null,
          'https://picsum.photos/800/400', // Placeholder image
          community.id,
          creator.id,
          i === 0 ? 0 : 20 + i * 5, // Attendee limit (0 for unlimited)
          i === 0 ? 1 : 0, // First event is private
          community.tags, // Use community tags for event tags
        ]
      );
      
      // Add event attendees
      if (eventStatus !== 'draft') {
        await addEventAttendees(eventId, users, creator.id);
      }
    }
  }
}

/**
 * Add attendees to an event
 */
async function addEventAttendees(eventId, users, creatorId) {
  const rsvpStatuses = ['going', 'interested', 'not_going'];
  
  for (const user of users) {
    // Creator is automatically going
    const status = user.id === creatorId ? 'going' : rsvpStatuses[Math.floor(Math.random() * rsvpStatuses.length)];
    
    await run(
      'INSERT INTO event_attendees (id, event_id, user_id, status, is_organizer, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
      [uuidv4(), eventId, user.id, status, user.id === creatorId ? 1 : 0]
    );
  }
}

/**
 * Create test matches between users
 */
async function createTestMatches(users) {
  // Create matches between users (not all users match with all other users)
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      // 70% chance of a match between any two users
      if (Math.random() < 0.7) {
        await run(
          'INSERT INTO matches (id, user1_id, user2_id, created_at, updated_at) VALUES (?, ?, ?, datetime("now"), datetime("now"))',
          [uuidv4(), users[i].id, users[j].id]
        );
      }
    }
  }
}

/**
 * Create test conversations and messages between matched users
 */
async function createTestConversations(users) {
  // Get all matches
  const matches = await all("SELECT user1_id, user2_id FROM matches WHERE user1_id LIKE 'test-%'");
  
  for (const match of matches) {
    const user1 = match.user1_id;
    const user2 = match.user2_id;
    
    // Create conversation
    const conversationId = `test-conversation-${user1}-${user2}`;
    await run(
      'INSERT INTO conversations (id, user1_id, user2_id, created_at, updated_at) VALUES (?, ?, ?, datetime("now"), datetime("now"))',
      [conversationId, user1, user2]
    );
    
    // Create messages in this conversation
    const messageCount = 5 + Math.floor(Math.random() * 10); // 5-15 messages
    
    for (let i = 0; i < messageCount; i++) {
      // Alternate sender
      const sender = i % 2 === 0 ? user1 : user2;
      const receiver = i % 2 === 0 ? user2 : user1;
      
      // Create message
      await run(
        'INSERT INTO messages (id, conversation_id, sender_id, receiver_id, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
        [
          uuidv4(),
          conversationId,
          sender,
          receiver,
          `Test message ${i + 1} from ${sender} to ${receiver}`,
        ]
      );
    }
  }
}

// Run the seeding function
seedTestData()
  .then(() => {
    console.log('Database seeded successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error seeding database:', err);
    process.exit(1);
  });
