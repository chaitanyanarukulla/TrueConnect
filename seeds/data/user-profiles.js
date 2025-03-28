/**
 * Predefined user profiles with realistic personal details
 * 
 * This module provides comprehensive user profiles for the TrueConnect dating app,
 * including realistic names, bios, interests, and other attributes. Enhanced with
 * additional profile details for better matching and compatibility analysis.
 */

// Define realistic user profiles for the dating app
const userProfiles = [
  {
    name: 'Emma Rodriguez',
    bio: 'Passionate photographer and travel enthusiast. Always planning my next adventure! Looking for someone who enjoys exploring new places and trying local cuisines.',
    interests: ['Photography', 'Travel', 'Hiking', 'Cooking', 'Languages'],
    occupation: 'Travel Photographer',
    education: 'Bachelor\'s Degree',
    location: 'San Francisco, CA',
    ageRange: { min: 25, max: 40 },
    socialMedia: {
      instagram: 'emma_roams',
      twitter: 'emmaphotography'
    },
    relationshipType: 'long-term',
    lifestyle: {
      smoking: 'non-smoker',
      drinking: 'social',
      diet: 'omnivore',
      exercise: 'regularly'
    },
    personality: ['adventurous', 'creative', 'curious', 'open-minded', 'independent'],
    values: ['freedom', 'adventure', 'authenticity', 'creativity', 'growth']
  },
  {
    name: 'Michael Chen',
    bio: 'Software engineer by day, amateur chef by night. Love experimenting with fusion recipes and hosting dinner parties. Seeking someone who appreciates good food and thoughtful conversation.',
    interests: ['Cooking', 'Technology', 'Reading', 'Gaming', 'Movies'],
    occupation: 'Software Engineer',
    education: 'Master\'s Degree',
    location: 'New York, NY',
    ageRange: { min: 24, max: 38 },
    socialMedia: {
      instagram: 'chen_cooks',
      twitter: 'michael_codes',
      linkedin: 'michaelchendev'
    },
    relationshipType: 'long-term',
    lifestyle: {
      smoking: 'non-smoker',
      drinking: 'social',
      diet: 'omnivore',
      exercise: 'sometimes'
    },
    personality: ['analytical', 'creative', 'patient', 'logical', 'focused'],
    values: ['creativity', 'balance', 'knowledge', 'excellence', 'friendship']
  },
  {
    name: 'Sophia Williams',
    bio: 'Yoga instructor and wellness coach passionate about holistic living. Spend my free time hiking, meditating, and trying out new plant-based recipes. Looking for someone who values health and mindfulness.',
    interests: ['Yoga', 'Meditation', 'Hiking', 'Cooking', 'Reading'],
    occupation: 'Yoga Instructor',
    education: 'Yoga Teacher Training Certification',
    location: 'Los Angeles, CA',
    ageRange: { min: 25, max: 40 },
    socialMedia: {
      instagram: 'sophia_wellness',
      twitter: 'sophiayoga'
    },
    relationshipType: 'long-term',
    lifestyle: {
      smoking: 'non-smoker',
      drinking: 'non-drinker',
      diet: 'vegan',
      exercise: 'daily'
    },
    personality: ['calm', 'empathetic', 'gentle', 'passionate', 'mindful'],
    values: ['wellness', 'mindfulness', 'balance', 'peace', 'spirituality']
  },
  {
    name: 'James Wilson',
    bio: 'Music producer and avid concert-goer. Always searching for new sounds and artists. Would love to meet someone who shares my passion for live music and creative expression.',
    interests: ['Music', 'Concerts', 'Travel', 'Art', 'Technology'],
    occupation: 'Music Producer',
    education: 'Bachelor\'s in Music Production',
    location: 'Chicago, IL',
    ageRange: { min: 22, max: 38 },
    socialMedia: {
      instagram: 'james_beats',
      twitter: 'wilsonbeats',
      soundcloud: 'jameswilson'
    },
    relationshipType: 'casual',
    lifestyle: {
      smoking: 'occasional',
      drinking: 'social',
      diet: 'omnivore',
      exercise: 'sometimes'
    },
    personality: ['creative', 'passionate', 'energetic', 'spontaneous', 'charismatic'],
    values: ['creativity', 'passion', 'innovation', 'freedom', 'fun']
  },
  {
    name: 'Olivia Kim',
    bio: 'Environmental scientist working on climate solutions. Love outdoor adventures, from hiking to kayaking. Seeking a partner who values sustainability and isn\'t afraid of a little mud on their boots.',
    interests: ['Hiking', 'Kayaking', 'Environment', 'Science', 'Reading'],
    occupation: 'Environmental Scientist',
    education: 'PhD in Environmental Science',
    location: 'Seattle, WA',
    ageRange: { min: 27, max: 42 },
    socialMedia: {
      instagram: 'olivia_outdoors',
      twitter: 'dr_kim_science',
      linkedin: 'oliviakimphd'
    },
    relationshipType: 'long-term',
    lifestyle: {
      smoking: 'non-smoker',
      drinking: 'social',
      diet: 'vegetarian',
      exercise: 'regularly'
    },
    personality: ['analytical', 'passionate', 'determined', 'intellectual', 'curious'],
    values: ['environmentalism', 'sustainability', 'education', 'responsibility', 'knowledge']
  },
  {
    name: 'David Thompson',
    bio: 'Startup founder passionate about innovation and problem-solving. When I\'m not working, you\'ll find me rock climbing or exploring local breweries. Looking for someone ambitious who values both adventure and downtime.',
    interests: ['Rock Climbing', 'Technology', 'Entrepreneurship', 'Brewing', 'Hiking'],
    occupation: 'Startup Founder',
    education: 'MBA',
    location: 'Austin, TX',
    ageRange: { min: 25, max: 40 },
    socialMedia: {
      instagram: 'dave_climbs',
      twitter: 'davidthompson_tech',
      linkedin: 'davidthompsonfounder'
    },
    relationshipType: 'long-term',
    lifestyle: {
      smoking: 'non-smoker',
      drinking: 'social',
      diet: 'omnivore',
      exercise: 'regularly'
    },
    personality: ['ambitious', 'confident', 'innovative', 'adventurous', 'determined'],
    values: ['innovation', 'achievement', 'balance', 'adventure', 'success']
  },
  {
    name: 'Ava Patel',
    bio: 'Pediatric nurse with a passion for making children smile. Love dancing, painting, and weekend getaways to the beach. Looking for someone kind-hearted who enjoys both spontaneity and relaxed evenings at home.',
    interests: ['Dancing', 'Painting', 'Beach', 'Travel', 'Movies'],
    occupation: 'Pediatric Nurse',
    education: 'Bachelor\'s in Nursing',
    location: 'San Diego, CA',
    ageRange: { min: 24, max: 36 },
    socialMedia: {
      instagram: 'ava_creates',
      twitter: 'ava_nurselife'
    },
    relationshipType: 'long-term',
    lifestyle: {
      smoking: 'non-smoker',
      drinking: 'social',
      diet: 'omnivore',
      exercise: 'sometimes'
    },
    personality: ['caring', 'empathetic', 'creative', 'gentle', 'spontaneous'],
    values: ['compassion', 'kindness', 'balance', 'creativity', 'fun']
  },
  {
    name: 'Ethan Rivera',
    bio: 'High school history teacher who loves bringing the past to life. Passionate about historical documentaries, museums, and travel. Seeking someone curious about the world with a good sense of humor.',
    interests: ['History', 'Travel', 'Museums', 'Reading', 'Hiking'],
    occupation: 'History Teacher',
    education: 'Master\'s in Education',
    location: 'Boston, MA',
    ageRange: { min: 28, max: 42 },
    socialMedia: {
      instagram: 'mr_rivera_history',
      twitter: 'ethan_teaches'
    },
    relationshipType: 'long-term',
    lifestyle: {
      smoking: 'non-smoker',
      drinking: 'social',
      diet: 'omnivore',
      exercise: 'sometimes'
    },
    personality: ['intellectual', 'curious', 'patient', 'funny', 'passionate'],
    values: ['education', 'knowledge', 'curiosity', 'tradition', 'growth']
  },
  {
    name: 'Isabella Nguyen',
    bio: 'Graphic designer with a love for street art and typography. Spend weekends exploring art galleries and trying new coffee shops. Looking for someone creative who appreciates aesthetics and authenticity.',
    interests: ['Design', 'Art', 'Coffee', 'Photography', 'Music'],
    occupation: 'Graphic Designer',
    education: 'Bachelor\'s in Fine Arts',
    location: 'Portland, OR',
    ageRange: { min: 24, max: 38 },
    socialMedia: {
      instagram: 'isabella_designs',
      behance: 'isabellandesign',
      twitter: 'bellanguyenart'
    },
    relationshipType: 'long-term',
    lifestyle: {
      smoking: 'non-smoker',
      drinking: 'social',
      diet: 'omnivore',
      exercise: 'sometimes'
    },
    personality: ['creative', 'artistic', 'quiet', 'thoughtful', 'independent'],
    values: ['authenticity', 'creativity', 'aesthetics', 'self-expression', 'balance']
  },
  {
    name: 'Alexander Johnson',
    bio: 'Chef at a farm-to-table restaurant passionate about sustainable food. Avid gardener and farmers market enthusiast. Seeking someone who appreciates the journey from soil to plate and values community connection.',
    interests: ['Cooking', 'Gardening', 'Farmers Markets', 'Sustainability', 'Wine'],
    occupation: 'Chef',
    education: 'Culinary School',
    location: 'San Francisco, CA',
    ageRange: { min: 28, max: 45 },
    socialMedia: {
      instagram: 'chef_alex_j',
      twitter: 'alexjcooks'
    },
    relationshipType: 'long-term',
    lifestyle: {
      smoking: 'non-smoker',
      drinking: 'social',
      diet: 'omnivore',
      exercise: 'regularly'
    },
    personality: ['passionate', 'creative', 'patient', 'detail-oriented', 'generous'],
    values: ['sustainability', 'community', 'craftsmanship', 'health', 'authenticity']
  },
  {
    name: 'Sofia Garcia',
    bio: 'Financial analyst by day, salsa dancer by night. Love international travel and learning about different cultures. Looking for a partner who enjoys dancing and discovering new perspectives.',
    interests: ['Dancing', 'Travel', 'Finance', 'Languages', 'Food'],
    occupation: 'Financial Analyst',
    education: 'MBA',
    location: 'Miami, FL',
    ageRange: { min: 26, max: 40 },
    socialMedia: {
      instagram: 'sofia_dances',
      linkedin: 'sofiagarcia_finance',
      twitter: 'sofiagarcia'
    },
    relationshipType: 'long-term',
    lifestyle: {
      smoking: 'non-smoker',
      drinking: 'social',
      diet: 'omnivore',
      exercise: 'regularly'
    },
    personality: ['energetic', 'organized', 'analytical', 'outgoing', 'passionate'],
    values: ['balance', 'achievement', 'personal growth', 'culture', 'adventure']
  },
  {
    name: 'Lucas Wright',
    bio: 'Veterinarian and animal welfare advocate. Spend free time hiking with my rescue dog and volunteering at wildlife sanctuaries. Seeking someone compassionate who loves animals and outdoor adventures.',
    interests: ['Animals', 'Hiking', 'Volunteering', 'Nature', 'Reading'],
    occupation: 'Veterinarian',
    education: 'Doctorate in Veterinary Medicine',
    location: 'Denver, CO',
    ageRange: { min: 28, max: 42 },
    socialMedia: {
      instagram: 'dr_lucas_pets',
      twitter: 'drwright_vet'
    },
    relationshipType: 'long-term',
    lifestyle: {
      smoking: 'non-smoker',
      drinking: 'sometimes',
      diet: 'vegetarian',
      exercise: 'regularly'
    },
    personality: ['compassionate', 'gentle', 'patient', 'dedicated', 'honest'],
    values: ['compassion', 'environmentalism', 'responsibility', 'kindness', 'generosity']
  },
  {
    name: 'Maya Jackson',
    bio: 'Freelance writer specializing in travel journalism. Always planning my next international adventure. Looking for someone open-minded who enjoys exploring new cultures and stepping outside their comfort zone.',
    interests: ['Writing', 'Travel', 'Photography', 'Languages', 'Food'],
    occupation: 'Travel Writer',
    education: 'Bachelor\'s in Journalism',
    location: 'New York, NY',
    ageRange: { min: 25, max: 40 },
    socialMedia: {
      instagram: 'maya_writes_travels',
      twitter: 'mayajacksonwrites',
      linkedin: 'mayajackson_writer'
    },
    relationshipType: 'casual',
    lifestyle: {
      smoking: 'occasional',
      drinking: 'social',
      diet: 'omnivore',
      exercise: 'sometimes'
    },
    personality: ['adventurous', 'curious', 'independent', 'open-minded', 'creative'],
    values: ['freedom', 'adventure', 'curiosity', 'culture', 'authenticity']
  },
  {
    name: 'Daniel Kim',
    bio: 'Architect with a passion for sustainable urban design. Love sketching, photography, and exploring cities on foot. Seeking someone who appreciates thoughtful design and enjoys meaningful conversations.',
    interests: ['Architecture', 'Design', 'Photography', 'Urban Exploration', 'Art'],
    occupation: 'Architect',
    education: 'Master\'s in Architecture',
    location: 'Chicago, IL',
    ageRange: { min: 27, max: 42 },
    socialMedia: {
      instagram: 'daniel_designs',
      linkedin: 'danielkim_architect'
    },
    relationshipType: 'long-term',
    lifestyle: {
      smoking: 'non-smoker',
      drinking: 'social',
      diet: 'omnivore',
      exercise: 'sometimes'
    },
    personality: ['creative', 'thoughtful', 'detail-oriented', 'analytical', 'quiet'],
    values: ['sustainability', 'aesthetics', 'craftsmanship', 'innovation', 'balance']
  },
  {
    name: 'Zoe Mitchell',
    bio: 'Professional dancer and dance instructor. Passionate about creative expression and movement. Looking for someone who values art, creativity, and isn\'t afraid to step onto the dance floor occasionally!',
    interests: ['Dance', 'Music', 'Fitness', 'Theater', 'Travel'],
    occupation: 'Professional Dancer',
    education: 'Bachelor\'s in Dance',
    location: 'Los Angeles, CA',
    ageRange: { min: 24, max: 38 },
    socialMedia: {
      instagram: 'zoe_dances',
      twitter: 'zoemmitchell'
    },
    relationshipType: 'casual',
    lifestyle: {
      smoking: 'non-smoker',
      drinking: 'social',
      diet: 'vegetarian',
      exercise: 'daily'
    },
    personality: ['energetic', 'passionate', 'spontaneous', 'creative', 'expressive'],
    values: ['creativity', 'self-expression', 'passion', 'health', 'fun']
  },
  {
    name: 'Noah Martinez',
    bio: 'Mechanical engineer with a love for classic motorcycles and restoring vintage cars. Weekends are for road trips and garage projects. Seeking someone who appreciates craftsmanship and the open road.',
    interests: ['Motorcycles', 'Engineering', 'Road Trips', 'Mechanics', 'Music'],
    occupation: 'Mechanical Engineer',
    education: 'Bachelor\'s in Mechanical Engineering',
    location: 'Austin, TX',
    ageRange: { min: 26, max: 40 },
    socialMedia: {
      instagram: 'noah_builds',
      linkedin: 'noahmartinez_engineer'
    },
    relationshipType: 'long-term',
    lifestyle: {
      smoking: 'non-smoker',
      drinking: 'social',
      diet: 'omnivore',
      exercise: 'sometimes'
    },
    personality: ['patient', 'detail-oriented', 'reliable', 'practical', 'focused'],
    values: ['craftsmanship', 'freedom', 'reliability', 'adventure', 'authenticity']
  },
  {
    name: 'Madison Lee',
    bio: 'Tech startup product manager passionate about solving user problems. Love hiking, rock climbing, and discovering new podcasts. Looking for someone curious and adventurous with a growth mindset.',
    interests: ['Technology', 'Hiking', 'Rock Climbing', 'Podcasts', 'Psychology'],
    occupation: 'Product Manager',
    education: 'Master\'s in Human-Computer Interaction',
    location: 'Seattle, WA',
    ageRange: { min: 25, max: 38 },
    socialMedia: {
      instagram: 'madison_explores',
      twitter: 'madisonlee_tech',
      linkedin: 'madisonlee'
    },
    relationshipType: 'long-term',
    lifestyle: {
      smoking: 'non-smoker',
      drinking: 'social',
      diet: 'omnivore',
      exercise: 'regularly'
    },
    personality: ['analytical', 'curious', 'ambitious', 'adventurous', 'focused'],
    values: ['innovation', 'growth', 'achievement', 'curiosity', 'balance']
  },
  {
    name: 'Benjamin Taylor',
    bio: 'Marine biologist dedicated to ocean conservation. Passionate about scuba diving, surfing, and beachcombing. Seeking someone who loves the ocean and cares about environmental sustainability.',
    interests: ['Marine Life', 'Scuba Diving', 'Surfing', 'Conservation', 'Photography'],
    occupation: 'Marine Biologist',
    education: 'PhD in Marine Biology',
    location: 'San Diego, CA',
    ageRange: { min: 28, max: 44 },
    socialMedia: {
      instagram: 'ben_oceans',
      twitter: 'dr_bentaylor',
      linkedin: 'benjamintaylor_marine'
    },
    relationshipType: 'long-term',
    lifestyle: {
      smoking: 'non-smoker',
      drinking: 'sometimes',
      diet: 'pescatarian',
      exercise: 'regularly'
    },
    personality: ['passionate', 'dedicated', 'curious', 'intellectual', 'adventurous'],
    values: ['environmentalism', 'conservation', 'education', 'sustainability', 'adventure']
  },
  {
    name: 'Amelia Clark',
    bio: 'Elementary school art teacher who believes creativity can change the world. Love painting, museums, and flea market treasure hunting. Looking for someone who values imagination and can see the extraordinary in everyday life.',
    interests: ['Art', 'Painting', 'Museums', 'Vintage Shopping', 'Teaching'],
    occupation: 'Art Teacher',
    education: 'Master\'s in Art Education',
    location: 'Portland, OR',
    ageRange: { min: 26, max: 40 },
    socialMedia: {
      instagram: 'ms_clark_creates',
      twitter: 'ameliaclarkart'
    },
    relationshipType: 'long-term',
    lifestyle: {
      smoking: 'non-smoker',
      drinking: 'sometimes',
      diet: 'omnivore',
      exercise: 'sometimes'
    },
    personality: ['creative', 'imaginative', 'gentle', 'caring', 'optimistic'],
    values: ['creativity', 'imagination', 'education', 'kindness', 'joy']
  },
  {
    name: 'Liam Wilson',
    bio: 'Filmmaker and documentary producer passionate about telling untold stories. Always searching for the perfect shot and compelling narratives. Seeking someone who appreciates thoughtful storytelling and shared adventures.',
    interests: ['Filmmaking', 'Photography', 'Travel', 'Hiking', 'Reading'],
    occupation: 'Filmmaker',
    education: 'Bachelor\'s in Film Production',
    location: 'Los Angeles, CA',
    ageRange: { min: 25, max: 42 },
    socialMedia: {
      instagram: 'liam_captures',
      twitter: 'liamwilson_films',
      vimeo: 'liamwilson'
    },
    relationshipType: 'long-term',
    lifestyle: {
      smoking: 'non-smoker',
      drinking: 'social',
      diet: 'omnivore',
      exercise: 'sometimes'
    },
    personality: ['creative', 'thoughtful', 'passionate', 'observant', 'patient'],
    values: ['authenticity', 'storytelling', 'creativity', 'curiosity', 'adventure']
  },
  {
    name: 'Jasmine Shah',
    bio: 'Nutritionist and wellness blogger specializing in plant-based cuisine. Love farmers markets, yoga, and hiking. Looking for someone health-conscious who enjoys cooking together and outdoor activities.',
    interests: ['Nutrition', 'Cooking', 'Yoga', 'Hiking', 'Wellness'],
    occupation: 'Nutritionist',
    education: 'Master\'s in Nutrition',
    location: 'San Francisco, CA',
    ageRange: { min: 27, max: 40 },
    socialMedia: {
      instagram: 'jasmine_wellness',
      twitter: 'jasmineshahnutrition',
      linkedin: 'jasmineshah'
    },
    relationshipType: 'long-term',
    lifestyle: {
      smoking: 'non-smoker',
      drinking: 'non-drinker',
      diet: 'vegan',
      exercise: 'daily'
    },
    personality: ['calm', 'nurturing', 'organized', 'dedicated', 'compassionate'],
    values: ['health', 'wellness', 'sustainability', 'mindfulness', 'education']
  }
];

module.exports = userProfiles;
