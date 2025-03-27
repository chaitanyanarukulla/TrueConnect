const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database configuration
const dbPath = path.join(__dirname, 'backend', 'trueconnect.sqlite');
console.log('Connecting to database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Check counts of different entities
async function checkDatabase() {
  try {
    // Users
    const users = await countTable('users');
    console.log(`Users: ${users}`);
    
    // Communities
    const communities = await countTable('communities');
    console.log(`Communities: ${communities}`);
    
    // Community Members
    const communityMembers = await countTable('community_members');
    console.log(`Community Members: ${communityMembers}`);
    
    // Matches
    const matches = await countTable('matches');
    console.log(`Matches: ${matches}`);
    
    // Conversations
    const conversations = await countTable('conversations');
    console.log(`Conversations: ${conversations}`);
    
    // Messages
    const messages = await countTable('messages');
    console.log(`Messages: ${messages}`);
    
    // Sample data
    console.log('\nSample User Data:');
    const sampleUsers = await getRows('SELECT id, name, email FROM users LIMIT 3');
    sampleUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
    });
    
    console.log('\nSample Community Data:');
    const sampleCommunities = await getRows('SELECT id, name FROM communities LIMIT 3');
    sampleCommunities.forEach(community => {
      console.log(`- ${community.name}`);
    });
    
    console.log('\nSample Match Data:');
    const sampleMatches = await getRows('SELECT id, userId, targetUserId, status FROM matches LIMIT 3');
    sampleMatches.forEach(match => {
      console.log(`- Match between ${match.userId} and ${match.targetUserId} (Status: ${match.status})`);
    });
    
    console.log('\nSample Conversation Data:');
    const sampleConversations = await getRows('SELECT id, user1Id, user2Id FROM conversations LIMIT 3');
    sampleConversations.forEach(conversation => {
      console.log(`- Conversation between ${conversation.user1Id} and ${conversation.user2Id}`);
    });
    
    console.log('\nSample Message Data:');
    const sampleMessages = await getRows('SELECT id, conversationId, senderId, content FROM messages LIMIT 3');
    sampleMessages.forEach(message => {
      console.log(`- Message from ${message.senderId}: "${message.content}"`);
    });
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    db.close();
  }
}

// Helper function to count rows in a table
function countTable(tableName) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT COUNT(*) as count FROM ${tableName}`, [], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row.count);
      }
    });
  });
}

// Helper function to get rows from a table
function getRows(query) {
  return new Promise((resolve, reject) => {
    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Run the check
checkDatabase();
