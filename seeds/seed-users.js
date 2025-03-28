/**
 * User Seeding Module
 * 
 * This module is responsible for seeding user data into the database.
 */

const { run, get, all } = require('./utils/db');
const { 
  generateId, 
  hashPassword, 
  getRandomElement, 
  getRandomElements, 
  getRandomPastDate,
  getRandomBoolean
} = require('./utils/helpers');
const { 
  profilePictures, 
  cities, 
  interests, 
  genders, 
  lookingFor, 
  occupations,
  education,
  relationshipTypes,
  smokingPreferences,
  drinkingPreferences,
  dietPreferences,
  exerciseFrequency,
  personalityTraits,
  coreValues
} = require('./data/constants');
const userProfiles = require('./data/user-profiles');

/**
 * Create users in the database
 * @param {object} db - Database connection
 * @param {number} count - Number of users to create (excluding admin)
 * @returns {Promise<Array>} - Array of created user objects with IDs
 */
async function seedUsers(db, count = 49) {
  console.log('Creating users...');
  const users = [];
  const userIds = [];

  try {
    // Create admin user first
    const adminPassword = await hashPassword('admin123');
    const adminId = generateId();
    
    const adminUser = {
      id: adminId,
      name: 'Admin User',
      email: 'admin@trueconnect.com',
      password: adminPassword,
      birthdate: new Date('1990-01-01').toISOString(),
      gender: 'Other',
      location: 'San Francisco, CA',
      bio: 'TrueConnect administrator and product owner',
      profilePicture: null, // Use null to trigger the initials fallback
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
      relationshipType: 'networking',
      lifestyle: JSON.stringify({
        smoking: 'non-smoker',
        drinking: 'social',
        diet: 'omnivore',
        exercise: 'sometimes'
      }),
      personality: JSON.stringify(['analytical', 'organized', 'innovative', 'focused', 'professional']),
      values: JSON.stringify(['integrity', 'excellence', 'innovation', 'respect', 'responsibility']),
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
    userIds.push(adminId);

    // Create predefined users with realistic profiles
    const hashedPassword = await hashPassword('password123');
    
    // Use the detailed user profiles first
    for (let i = 0; i < Math.min(userProfiles.length, count); i++) {
      const profile = userProfiles[i];
      const userId = generateId();
      const userEmail = `${profile.name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
      
      // Generate random birthdate based on age range in profile
      const now = new Date();
      const minAge = profile.ageRange?.min || 25;
      const maxAge = profile.ageRange?.max || 40;
      const age = minAge + Math.floor(Math.random() * (maxAge - minAge));
      const birthYear = now.getFullYear() - age;
      const birthMonth = 1 + Math.floor(Math.random() * 12);
      const birthDay = 1 + Math.floor(Math.random() * 28);
      
      // Determine gender based on name or randomly assign if ambiguous
      let gender;
      if (profile.gender) {
        gender = profile.gender;
      } else {
        // Simple heuristic - could be improved with a proper gender detection library
        const femaleNames = ['Emma', 'Sophia', 'Olivia', 'Ava', 'Isabella', 'Sofia', 'Maya', 'Zoe', 'Amelia', 'Madison', 'Jasmine'];
        const maleNames = ['Michael', 'James', 'David', 'Ethan', 'Alexander', 'Lucas', 'Noah', 'Benjamin', 'Liam', 'Daniel'];
        
        const firstName = profile.name.split(' ')[0];
        if (femaleNames.includes(firstName)) {
          gender = 'Female';
        } else if (maleNames.includes(firstName)) {
          gender = 'Male';
        } else {
          gender = getRandomElement(genders);
        }
      }
      
      // Generate preferences based on typical patterns
      const genderPrefs = profile.genderPreferences || 
        (gender === 'Male' ? ['Female'] : 
         gender === 'Female' ? ['Male'] : 
         getRandomElements(genders, 1 + Math.floor(Math.random() * 3)));
      
      // Use null for profile picture to trigger the fallback to initials in the UI
      const user = {
        id: userId,
        name: profile.name,
        email: userEmail,
        password: hashedPassword,
        birthdate: new Date(birthYear, birthMonth - 1, birthDay).toISOString(),
        gender: gender,
        location: profile.location,
        bio: profile.bio,
        profilePicture: null, // Use null to trigger the initials fallback
        interests: JSON.stringify(profile.interests),
        preferences: JSON.stringify({
          ageRange: profile.ageRange || { min: 21, max: 45 },
          distance: 25 + Math.floor(Math.random() * 75),
          genderPreferences: genderPrefs
        }),
        socialMedia: JSON.stringify(profile.socialMedia || {
          instagram: profile.name.toLowerCase().replace(/\s+/g, '.'),
          twitter: profile.name.toLowerCase().replace(/\s+/g, '_'),
        }),
        lookingFor: profile.lookingFor || getRandomElement(lookingFor),
        occupation: profile.occupation,
        education: profile.education,
        relationshipType: profile.relationshipType || getRandomElement(relationshipTypes),
        lifestyle: JSON.stringify(profile.lifestyle || {
          smoking: profile.lifestyle?.smoking || getRandomElement(smokingPreferences),
          drinking: profile.lifestyle?.drinking || getRandomElement(drinkingPreferences),
          diet: profile.lifestyle?.diet || getRandomElement(dietPreferences),
          exercise: profile.lifestyle?.exercise || getRandomElement(exerciseFrequency)
        }),
        personality: JSON.stringify(profile.personality || getRandomElements(personalityTraits, 5)),
        values: JSON.stringify(profile.values || getRandomElements(coreValues, 5)),
        privacySettings: JSON.stringify({
          showLocation: getRandomBoolean(0.7),
          showAge: getRandomBoolean(0.8),
          showLastActive: getRandomBoolean(0.5),
          showOnlineStatus: getRandomBoolean(0.6)
        }),
        isVerified: getRandomBoolean(0.7),
        isPremium: getRandomBoolean(0.3),
        isActive: true,
        role: 'user',
        acceptedTerms: true,
        createdAt: getRandomPastDate(1, 90).toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      users.push(user);
      userIds.push(userId);
    }
    
    // Create additional random users if needed to reach the count
    for (let i = userProfiles.length; i < count; i++) {
      const gender = getRandomElement(genders);
      const birthYear = 1980 + Math.floor(Math.random() * 25);
      const birthMonth = 1 + Math.floor(Math.random() * 12);
      const birthDay = 1 + Math.floor(Math.random() * 28);
      
      const userInterests = getRandomElements(interests, 3 + Math.floor(Math.random() * 5));
      const genderPrefs = getRandomElements(genders, 1 + Math.floor(Math.random() * 3));
      
      const userId = generateId();
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
        profilePicture: null, // Use null to trigger the initials fallback
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
        relationshipType: getRandomElement(relationshipTypes),
        lifestyle: JSON.stringify({
          smoking: getRandomElement(smokingPreferences),
          drinking: getRandomElement(drinkingPreferences),
          diet: getRandomElement(dietPreferences),
          exercise: getRandomElement(exerciseFrequency)
        }),
        personality: JSON.stringify(getRandomElements(personalityTraits, 5)),
        values: JSON.stringify(getRandomElements(coreValues, 5)),
        privacySettings: JSON.stringify({
          showLocation: getRandomBoolean(0.7),
          showAge: getRandomBoolean(0.8),
          showLastActive: getRandomBoolean(0.5),
          showOnlineStatus: getRandomBoolean(0.6)
        }),
        isVerified: getRandomBoolean(0.7),
        isPremium: getRandomBoolean(0.3),
        isActive: true,
        role: 'user',
        acceptedTerms: true,
        createdAt: getRandomPastDate(1, 90).toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      users.push(user);
      userIds.push(userId);
    }
    
    console.log(`Creating ${userProfiles.length} detailed profile users and ${Math.max(0, count - userProfiles.length)} random users...`);

    // Insert all users into the database
    for (const user of users) {
      await run(
        db,
        `INSERT INTO users (
          id, name, email, password, birthdate, gender, location, bio, 
          profilePicture, interests, preferences, socialMedia, lookingFor, 
          occupation, education, relationshipType, lifestyle, personality, values,
          privacySettings, isVerified, isPremium, isActive, role, acceptedTerms, 
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id, user.name, user.email, user.password,
          user.birthdate, user.gender, user.location, user.bio,
          user.profilePicture, user.interests, user.preferences,
          user.socialMedia, user.lookingFor, user.occupation,
          user.education, user.relationshipType, user.lifestyle, 
          user.personality, user.values, user.privacySettings, 
          user.isVerified, user.isPremium, user.isActive, 
          user.role, user.acceptedTerms, user.createdAt, user.updatedAt
        ]
      );
    }

    console.log(`Created ${users.length} users`);
    return users;
  } catch (error) {
    console.error('Error creating users:', error);
    throw error;
  }
}

module.exports = seedUsers;
