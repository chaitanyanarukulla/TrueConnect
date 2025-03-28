
/**
 * Events Seeding Module
 * 
 * This module is responsible for seeding events and RSVPs into the database.
 */

const { run, get, all } = require('./utils/db');
const { 
  generateId, 
  getRandomElement, 
  getRandomElements, 
  getRandomPastDate,
  getRandomFutureDate,
  getRandomBoolean,
  getRandomInt
} = require('./utils/helpers');
const { 
  eventImages, 
  eventTypes, 
  eventStatuses,
  eventNames,
  eventDescriptions,
  eventLocations,
  cityCoordinates,
  cities
} = require('./data/constants');

/**
 * Create events in the database
 * @param {object} db - Database connection
 * @param {Array} communities - Array of community objects with IDs
 * @param {Array} users - Array of user objects with IDs
 * @param {number} count - Number of events to create
 * @returns {Promise<Array>} - Array of created event objects with IDs
 */
async function seedEvents(db, communities, users, count = 30) {
  console.log('Creating events...');
  const events = [];

  try {
    // Define possible event states based on date
    const now = new Date();
    
    // Use the smaller of requested count or available event names
    const actualCount = Math.min(count, eventNames.length);
    
    for (let i = 0; i < actualCount; i++) {
      // Assign to a random community
      const community = getRandomElement(communities);
      const eventId = generateId();
      
      // Randomize event timing
      const isPast = getRandomBoolean(0.3);
      let startDate, endDate;
      
      if (isPast) {
        // Past event
        startDate = getRandomPastDate(10, 60);
        // Event duration 1-4 hours
        endDate = new Date(startDate.getTime() + (1 + Math.random() * 3) * 60 * 60 * 1000);
      } else {
        // Future event
        startDate = getRandomFutureDate(1, 30);
        // Event duration 1-4 hours
        endDate = new Date(startDate.getTime() + (1 + Math.random() * 3) * 60 * 60 * 1000);
      }
      
      // Determine event status based on timing
      let status;
      if (isPast) {
        status = 'COMPLETED';
      } else {
        status = getRandomBoolean(0.9) ? 'PUBLISHED' : getRandomElement(['DRAFT', 'CANCELLED']);
      }
      
      // Determine event type
      const type = getRandomElement(eventTypes);
      
      // Set location and coordinates based on type
      let location = null;
      let latitude = null;
      let longitude = null;
      
      if (type !== 'ONLINE') {
        // For in-person or hybrid events
        location = getRandomElement(eventLocations);
        
        // Add city-based coordinates for location-based discovery
        const eventCity = getRandomElement(cities);
        if (cityCoordinates[eventCity]) {
          latitude = cityCoordinates[eventCity].lat + (Math.random() * 0.02 - 0.01); // Small random offset
          longitude = cityCoordinates[eventCity].lng + (Math.random() * 0.02 - 0.01);
        }
      }
      
      // Generate popularity metrics for trending discovery
      const viewCount = getRandomInt(20, 500);
      const rsvpCount = type === 'ONLINE' ? getRandomInt(5, 100) : getRandomInt(3, 40);
      const shareCount = getRandomInt(0, 20);
      const popularityScore = viewCount + (rsvpCount * 5) + (shareCount * 3);
      
      const event = {
        id: eventId,
        name: eventNames[i % eventNames.length],
        description: eventDescriptions[i % eventDescriptions.length],
        communityId: community.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        location: location,
        type: type,
        status: status,
        maxAttendees: type === 'ONLINE' ? 100 + Math.floor(Math.random() * 900) : 20 + Math.floor(Math.random() * 80),
        currentAttendees: rsvpCount,
        imageUrl: null, // Use null to trigger the fallback display in UI
        externalUrl: getRandomBoolean(0.3) ? 'https://example.com/event' : null,
        latitude: latitude,
        longitude: longitude,
        viewCount: viewCount,
        shareCount: shareCount,
        popularityScore: popularityScore,
        settings: JSON.stringify({
          allowGuestList: true,
          sendReminders: true,
          allowComments: true
        }),
        tags: JSON.stringify(community.tags ? JSON.parse(community.tags) : ['general']),
        category: community.category,
        createdAt: getRandomPastDate(Math.max(7, (now - startDate) / (24 * 60 * 60 * 1000)), 90).toISOString(),
        updatedAt: getRandomPastDate(1, 7).toISOString()
      };
      
      events.push(event);
      
      // Get a random user ID to assign as creator
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const creatorId = randomUser?.id || '00000000-0000-0000-0000-000000000000'; // Fallback ID if users array is empty

      // Insert event into the database - with column names matching actual database schema
      await run(
        db,
        `INSERT INTO events (
          id, title, description, communityId, startTime, endTime, location,
          type, status, attendeeLimit, attendeeCount, imageUrl, virtualMeetingUrl,
          latitude, longitude, viewCount, shareCount, popularityScore,
          settings, tags, category, createdAt, updatedAt, creatorId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          event.id, event.name, event.description, event.communityId,
          event.startDate, event.endDate, event.location, event.type,
          event.status, event.maxAttendees, event.currentAttendees,
          event.imageUrl, event.externalUrl, event.latitude, event.longitude,
          event.viewCount, event.shareCount, event.popularityScore,
          event.settings, event.tags, event.category, event.createdAt, event.updatedAt,
          creatorId // Add the creator ID
        ]
      );
    }

    console.log(`Created ${events.length} events`);
    return events;
  } catch (error) {
    console.error('Error creating events:', error);
    throw error;
  }
}

/**
 * Create event RSVPs in the database
 * @param {object} db - Database connection
 * @param {Array} events - Array of event objects with IDs
 * @param {Array} users - Array of user objects with IDs
 * @returns {Promise<number>} - Number of RSVPs created
 */
async function seedEventRSVPs(db, events, users) {
  console.log('Creating event RSVPs...');
  let rsvpCount = 0;

  try {
    for (const event of events) {
      // Skip cancelled events
      if (event.status === 'CANCELLED') continue;
      
      // Generate 3-15 RSVPs per event
      const attendeeCount = event.currentAttendees; 
      const userIds = users.map(user => user.id);
      const attendeeUserIds = getRandomElements(userIds, attendeeCount);
      
      for (const userId of attendeeUserIds) {
        const rsvpId = generateId();
        const isPastEvent = new Date(event.startDate) < new Date();
        
        // Randomize attendance status based on event timing
        const statuses = isPastEvent 
          ? ['ATTENDING', 'ATTENDED', 'NO_SHOW'] 
          : ['ATTENDING', 'MAYBE'];
        
        const status = getRandomElement(statuses);
        const rsvpDate = new Date(new Date(event.createdAt).getTime() + Math.random() * (new Date() - new Date(event.createdAt)));
        
        const rsvp = {
          id: rsvpId,
          eventId: event.id,
          userId: userId,
          status: status,
          notes: getRandomBoolean(0.2) ? 'Looking forward to this event!' : null,
          guestCount: getRandomBoolean(0.3) ? 1 + Math.floor(Math.random() * 3) : 0,
          notificationsEnabled: getRandomBoolean(0.7),
          createdAt: rsvpDate.toISOString(),
          updatedAt: rsvpDate.toISOString()
        };
        
        await run(
          db,
          `INSERT INTO event_attendees (
            id, eventId, userId, status, note, notifications,
            attended, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            rsvp.id, rsvp.eventId, rsvp.userId, rsvp.status, 
            rsvp.notes, rsvp.notificationsEnabled,
            status === 'ATTENDED' ? 1 : 0,  // Convert status to attended boolean
            rsvp.createdAt, rsvp.updatedAt
          ]
        );
        
        rsvpCount++;
      }
    }

    console.log(`Created ${rsvpCount} event RSVPs`);
    return rsvpCount;
  } catch (error) {
    console.error('Error creating event RSVPs:', error);
    throw error;
  }
}

module.exports = {
  seedEvents,
  seedEventRSVPs
};
