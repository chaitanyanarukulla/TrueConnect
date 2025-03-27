/**
 * API Connection Test Script
 * 
 * Tests the connection between frontend and backend by making requests to key API endpoints
 * and verifying that data is being correctly transferred.
 */

const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'frontend', '.env.local') });

// API base URL from environment variables - corrected port to match backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Test credentials
const TEST_USER = {
  email: 'tester1@example.com',
  password: 'Test123!',
};

// Storage for auth tokens
let authTokens = {
  accessToken: null,
  refreshToken: null,
};

/**
 * Main test function to orchestrate all API tests
 */
async function testApiConnection() {
  console.log('🔍 Starting API connection tests...\n');
  console.log(`Using API URL: ${API_URL}\n`);
  
  try {
    // Test server connection
    await testServerConnection();
    
    // Test authentication endpoints
    const authSuccess = await testAuthentication();
    
    if (authSuccess) {
      // Test data retrieval endpoints
      await testUserProfile();
      await testMatches();
      await testCommunities();
      
      // Test data creation endpoints
      await testCreatePost();
    }
    
    console.log('\n✅ API connection tests completed');
  } catch (error) {
    console.error('\n❌ API tests failed:', error.message);
  }
}

/**
 * Test basic server connection
 */
async function testServerConnection() {
  try {
    console.log('Testing server connection...');
    
    // We'll try to connect to the auth/me endpoint, which should return 401 if not authenticated
    // This still confirms the server is running
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
    });
    
    if (response.status === 401) {
      console.log('✅ Server is running and responding (401 Unauthorized is expected)');
      return true;
    } else if (response.ok) {
      console.log('✅ Server is running and responding with OK status');
      return true;
    } else {
      console.log(`⚠️ Server responded with unexpected status: ${response.status}`);
      return true; // Still continue as server is responding
    }
  } catch (error) {
    console.error('❌ Server connection failed:', error.message);
    console.log('   Please check if the backend server is running at the configured URL');
    throw new Error('Server connection failed');
  }
}

/**
 * Test authentication endpoints
 */
async function testAuthentication() {
  console.log('\nTesting authentication endpoints...');
  
  try {
    // Attempt login with test credentials
    console.log(`Attempting login with ${TEST_USER.email}...`);
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password,
      }),
    });
    
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Login successful');
      console.log('   Received authentication tokens');
      
      // Store tokens for subsequent requests
      authTokens.accessToken = loginData.accessToken;
      authTokens.refreshToken = loginData.refreshToken;
      
      return true;
    } else {
      console.log(`❌ Login failed: ${loginData.error?.message || loginResponse.statusText}`);
      console.log('   This may indicate the test user does not exist in the database');
      console.log('   Consider running the seed-test-data.js script to create test users');
      return false;
    }
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    return false;
  }
}

/**
 * Test user profile retrieval
 */
async function testUserProfile() {
  console.log('\nTesting user profile retrieval...');
  
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authTokens.accessToken}`,
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ User profile retrieved successfully');
      console.log('   Profile data:');
      console.log(`   - Name: ${data.name}`);
      console.log(`   - Email: ${data.email}`);
      return true;
    } else {
      console.log(`❌ Profile retrieval failed: ${data.error?.message || response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Profile test failed:', error.message);
    return false;
  }
}

/**
 * Test matches retrieval
 */
async function testMatches() {
  console.log('\nTesting matches retrieval...');
  
  try {
    const response = await fetch(`${API_URL}/matches`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authTokens.accessToken}`,
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Matches retrieved successfully');
      console.log(`   Found ${data.length} matches`);
      return true;
    } else {
      console.log(`❌ Matches retrieval failed: ${data.error?.message || response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Matches test failed:', error.message);
    return false;
  }
}

/**
 * Test communities retrieval
 */
async function testCommunities() {
  console.log('\nTesting communities retrieval...');
  
  try {
    const response = await fetch(`${API_URL}/communities`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authTokens.accessToken}`,
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Communities retrieved successfully');
      console.log(`   Found ${data.length} communities`);
      
      if (data.length > 0) {
        // Test posts retrieval for the first community
        await testCommunityPosts(data[0].id);
      }
      
      return true;
    } else {
      console.log(`❌ Communities retrieval failed: ${data.error?.message || response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Communities test failed:', error.message);
    return false;
  }
}

/**
 * Test posts retrieval for a specific community
 */
async function testCommunityPosts(communityId) {
  console.log(`\nTesting posts retrieval for community ${communityId}...`);
  
  try {
    const response = await fetch(`${API_URL}/communities/${communityId}/posts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authTokens.accessToken}`,
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Posts retrieved successfully');
      console.log(`   Found ${data.length} posts`);
      return true;
    } else {
      console.log(`❌ Posts retrieval failed: ${data.error?.message || response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Posts test failed:', error.message);
    return false;
  }
}

/**
 * Test post creation
 */
async function testCreatePost() {
  console.log('\nTesting post creation...');
  
  try {
    // First get a community to post to
    const communitiesResponse = await fetch(`${API_URL}/communities`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authTokens.accessToken}`,
      },
    });
    
    const communities = await communitiesResponse.json();
    
    if (!communitiesResponse.ok || communities.length === 0) {
      console.log('❌ Cannot test post creation: No communities available');
      return false;
    }
    
    const communityId = communities[0].id;
    
    // Create a test post
    const postData = {
      title: 'API Test Post',
      content: 'This is a test post created by the API test script',
      type: 'text',
    };
    
    const createResponse = await fetch(`${API_URL}/communities/${communityId}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authTokens.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
    
    const createData = await createResponse.json();
    
    if (createResponse.ok) {
      console.log('✅ Post created successfully');
      console.log(`   Post ID: ${createData.id}`);
      return true;
    } else {
      console.log(`❌ Post creation failed: ${createData.error?.message || createResponse.statusText}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Post creation test failed:', error.message);
    return false;
  }
}

// Run the API connection tests
testApiConnection().catch(err => {
  console.error('Error during API connection tests:', err);
  process.exit(1);
});
