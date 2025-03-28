/**
 * Constant data for seed generation
 */

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

// Event image paths
const eventImages = [
  'event1.jpg',
  'event2.jpg',
  'event3.jpg',
  'event4.jpg',
  'event5.jpg',
  'event6.jpg',
  'event7.jpg',
  'event8.jpg',
];

// Possible values for user fields
const cities = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 
  'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA',
  'Dallas, TX', 'San Jose, CA', 'Austin, TX', 'Jacksonville, FL',
  'Fort Worth, TX', 'Columbus, OH', 'San Francisco, CA', 'Charlotte, NC'
];

// Coordinates for cities to enable location-based search
const cityCoordinates = {
  'New York, NY': { lat: 40.7128, lng: -74.0060 },
  'Los Angeles, CA': { lat: 34.0522, lng: -118.2437 },
  'Chicago, IL': { lat: 41.8781, lng: -87.6298 },
  'Houston, TX': { lat: 29.7604, lng: -95.3698 },
  'Phoenix, AZ': { lat: 33.4484, lng: -112.0740 },
  'Philadelphia, PA': { lat: 39.9526, lng: -75.1652 },
  'San Antonio, TX': { lat: 29.4241, lng: -98.4936 },
  'San Diego, CA': { lat: 32.7157, lng: -117.1611 },
  'Dallas, TX': { lat: 32.7767, lng: -96.7970 },
  'San Jose, CA': { lat: 37.3382, lng: -121.8863 },
  'Austin, TX': { lat: 30.2672, lng: -97.7431 },
  'Jacksonville, FL': { lat: 30.3322, lng: -81.6557 },
  'Fort Worth, TX': { lat: 32.7555, lng: -97.3308 },
  'Columbus, OH': { lat: 39.9612, lng: -82.9988 },
  'San Francisco, CA': { lat: 37.7749, lng: -122.4194 },
  'Charlotte, NC': { lat: 35.2271, lng: -80.8431 }
};

// User interests
const interests = [
  'Hiking', 'Reading', 'Travel', 'Cooking', 'Photography', 'Art', 'Music',
  'Fitness', 'Dancing', 'Gaming', 'Movies', 'Technology', 'Science', 
  'Fashion', 'Sports', 'Yoga', 'Meditation', 'Writing', 'Languages',
  'Volunteering', 'Food', 'Wine', 'Coffee', 'Pets', 'Gardening',
  'History', 'Politics', 'Philosophy', 'Theater', 'Bowling'
];

// User demographics
const genders = ['Male', 'Female', 'Non-binary', 'Other'];
const lookingFor = ['Relationship', 'Friendship', 'Casual', 'Networking'];

// Relationship types for more specific matching
const relationshipTypes = ['casual', 'long-term', 'friendship', 'marriage', 'unsure'];

// Lifestyle attributes
const smokingPreferences = ['non-smoker', 'occasional', 'regular', 'prefer-not-to-say'];
const drinkingPreferences = ['non-drinker', 'social', 'regular', 'prefer-not-to-say'];
const dietPreferences = ['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'gluten-free', 'other'];
const exerciseFrequency = ['rarely', 'sometimes', 'regularly', 'daily'];

// Personality traits for compatibility matching
const personalityTraits = [
  'adventurous', 'ambitious', 'analytical', 'artistic', 'assertive', 'calm',
  'caring', 'charismatic', 'confident', 'creative', 'curious', 'determined',
  'easy-going', 'empathetic', 'energetic', 'extroverted', 'flexible', 'focused',
  'friendly', 'funny', 'generous', 'gentle', 'hardworking', 'honest',
  'imaginative', 'independent', 'intellectual', 'introverted', 'intuitive', 'kind',
  'logical', 'loyal', 'modest', 'open-minded', 'optimistic', 'organized',
  'passionate', 'patient', 'persistent', 'practical', 'quiet', 'reliable',
  'reserved', 'responsible', 'romantic', 'sensitive', 'sincere', 'spontaneous',
  'thoughtful', 'trustworthy'
];

// Core values for deeper compatibility
const coreValues = [
  'achievement', 'adventure', 'authenticity', 'balance', 'community', 'compassion',
  'courage', 'creativity', 'curiosity', 'dedication', 'education', 'environmentalism',
  'equality', 'excellence', 'fairness', 'family', 'freedom', 'friendship',
  'fun', 'generosity', 'growth', 'harmony', 'health', 'honesty',
  'independence', 'innovation', 'integrity', 'justice', 'kindness', 'knowledge',
  'leadership', 'love', 'loyalty', 'mindfulness', 'openness', 'optimism',
  'passion', 'peace', 'personal growth', 'prosperity', 'reliability', 'respect',
  'responsibility', 'security', 'self-care', 'simplicity', 'spirituality', 'stability',
  'success', 'sustainability', 'tradition', 'wellness'
];
const occupations = [
  'Software Engineer', 'Doctor', 'Teacher', 'Lawyer', 'Artist',
  'Chef', 'Writer', 'Designer', 'Manager', 'Scientist', 'Student',
  'Entrepreneur', 'Marketing', 'Sales', 'Consultant', 'Engineer'
];
const education = [
  'High School', 'Associate Degree', 'Bachelor\'s Degree',
  'Master\'s Degree', 'PhD', 'Self-taught', 'Vocational Training'
];

// Community data
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

// Event data
const eventTypes = ['ONLINE', 'IN_PERSON', 'HYBRID'];
const eventStatuses = ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'];
const eventNames = [
  'Introduction to Digital Photography',
  'Weekend Hiking Trip',
  'Web Development Workshop',
  'Book Club Monthly Meeting',
  'Fitness Boot Camp',
  'Live Music Appreciation',
  'Cooking Class: Italian Cuisine',
  'Virtual Travel Meetup',
  'Tech Talk: AI and Machine Learning',
  'Art Gallery Tour',
  'Gaming Tournament',
  'Wellness and Mindfulness Session',
  'Professional Networking Event',
  'Language Exchange Meetup',
  'Movie Night: Classic Films',
  'Yoga in the Park',
  'Coffee Brewing Workshop',
  'Startup Pitch Competition',
  'Volunteer Day: Community Garden',
  'Wine Tasting Evening'
];

const eventDescriptions = [
  'Learn the basics of digital photography and improve your skills with hands-on practice.',
  'Join us for a day of hiking at a beautiful nearby trail with stunning views.',
  'A beginner-friendly workshop on building your first website with HTML, CSS, and JavaScript.',
  'Discuss this month\'s book selection and share your thoughts with fellow readers.',
  'An intense workout session led by professional trainers to help you achieve your fitness goals.',
  'Experience live music performances from local artists across various genres.',
  'Learn how to make authentic Italian dishes from scratch with our expert chef.',
  'Share your favorite travel experiences and get inspired for your next adventure.',
  'Explore the latest developments in artificial intelligence and machine learning.',
  'Guided tour of local art galleries featuring contemporary artists.',
  'Compete in a friendly gaming tournament with prizes for the winners.',
  'Practice mindfulness meditation and learn techniques for stress reduction.',
  'Connect with professionals in your industry and expand your network.',
  'Practice conversational skills in different languages with native speakers.',
  'Watch and discuss classic films with fellow movie enthusiasts.',
  'Practice yoga outdoors in a beautiful park setting for all skill levels.',
  'Learn the art of coffee brewing techniques from professional baristas.',
  'Watch innovative startups pitch their ideas to potential investors.',
  'Help maintain a community garden and learn about sustainable gardening practices.',
  'Sample and learn about different wine varieties with a professional sommelier.'
];

const eventLocations = [
  'City Library Conference Room',
  'Riverside Park Trail',
  'Tech Hub Coworking Space',
  'Community Bookstore',
  'City Fitness Center',
  'Downtown Music Venue',
  'Culinary School Kitchen',
  'Virtual Meeting',
  'University Lecture Hall',
  'Metropolitan Art Museum',
  'Gaming Center',
  'Wellness Studio',
  'Business Center',
  'Cultural Center',
  'Independent Theater',
  'Central Park',
  'Specialty Coffee Shop',
  'Innovation Center',
  'Community Garden',
  'Wine Bistro'
];

// Activity feed data
const activityTypes = [
  'match',
  'message',
  'community_join',
  'event_rsvp',
  'profile_view',
  'post_like',
  'post_comment'
];

module.exports = {
  profilePictures,
  eventImages,
  cities,
  cityCoordinates,
  interests,
  genders,
  lookingFor,
  occupations,
  education,
  communityCategories,
  communityNames,
  communityDescriptions,
  eventTypes,
  eventStatuses,
  eventNames,
  eventDescriptions,
  eventLocations,
  activityTypes,
  relationshipTypes,
  smokingPreferences,
  drinkingPreferences,
  dietPreferences,
  exerciseFrequency,
  personalityTraits,
  coreValues
};
