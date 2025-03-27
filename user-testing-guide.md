# TrueConnect User Testing Guide

## Overview

This document provides a comprehensive guide for conducting user testing of the TrueConnect dating app. The testing covers all core MVP features to validate functionality, usability, and overall user experience.

## Setup Instructions

### Environment Setup

1. **Start the backend server:**
   ```bash
   cd TrueConnect/backend
   npm install
   npm run start:dev
   ```

2. **Start the frontend application:**
   ```bash
   cd TrueConnect/frontend
   npm install
   npm run dev
   ```

3. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`

### Test User Accounts

Create the following test user accounts to facilitate testing:

**Primary Test User:**
- Email: tester1@example.com
- Password: Test123!
- Name: Test User 1
- Age: 28
- Gender: Female
- Interests: Hiking, Photography, Travel

**Secondary Test Users:**
- Email: tester2@example.com
- Password: Test123!
- Name: Test User 2
- Age: 30
- Gender: Male
- Interests: Hiking, Music, Technology

- Email: tester3@example.com
- Password: Test123!
- Name: Test User 3
- Age: 26
- Gender: Non-binary
- Interests: Gaming, Technology, Art

## Test Scenarios

### 1. Authentication Flow

- **Scenario 1.1: User Registration**
  - Access the app's home page
  - Click on "Sign Up"
  - Fill in registration details
  - Submit the form
  - Verify successful account creation
  - Verify redirection to dashboard

- **Scenario 1.2: User Login**
  - Navigate to the login page
  - Enter email and password
  - Click login button
  - Verify successful login
  - Verify authentication persistence (refresh the page)

- **Scenario 1.3: Password Reset Flow**
  - Navigate to login page
  - Click "Forgot Password"
  - Enter email address
  - Verify the reset flow works as expected

### 2. Profile Management

- **Scenario 2.1: View Profile**
  - Login with test account
  - Navigate to profile page
  - Verify all profile information is displayed correctly

- **Scenario 2.2: Edit Profile**
  - Navigate to profile edit page
  - Update profile information
  - Save changes
  - Verify updated information is reflected

- **Scenario 2.3: Profile Privacy Settings**
  - Locate privacy settings
  - Test adjusting various privacy options
  - Verify changes take effect

### 3. Matching and Discovery

- **Scenario 3.1: User Discovery**
  - Navigate to the discovery page
  - Browse through potential matches
  - Verify adequate information is shown
  - Test filtering options if available

- **Scenario 3.2: Matching Process**
  - Express interest in other users
  - Check for match notifications
  - Verify new matches appear in matches list

- **Scenario 3.3: Match Management**
  - View existing matches
  - Unmatch with a test user
  - Verify match is removed

### 4. Messaging System

- **Scenario 4.1: Start New Conversation**
  - Navigate to matches
  - Start a conversation with a match
  - Send initial message
  - Verify message appears in conversation

- **Scenario 4.2: Real-time Messaging**
  - Login with two different test accounts in separate browsers
  - Exchange messages between accounts
  - Verify real-time delivery
  - Test message status indicators if available

- **Scenario 4.3: Message History**
  - Close and reopen the app
  - Navigate to conversations
  - Verify previous messages are loaded

### 5. Community Features

- **Scenario 5.1: Community Discovery**
  - Navigate to communities section
  - Browse available communities
  - Verify community information is displayed correctly

- **Scenario 5.2: Community Creation**
  - Create a new community
  - Fill in all required details
  - Verify successful creation
  - Verify appearing in communities list

- **Scenario 5.3: Community Membership**
  - Join an existing community
  - Participate in community activities
  - Leave the community
  - Verify membership changes

### 6. Content Engagement

- **Scenario 6.1: Create Post**
  - Navigate to a community
  - Create different types of posts (text, link, image)
  - Verify successful post creation
  - Verify posts appear in feed

- **Scenario 6.2: Comment on Content**
  - View an existing post
  - Add a comment
  - Reply to an existing comment
  - Verify comment threading works correctly

- **Scenario 6.3: Reactions**
  - React to various posts and comments
  - Change reaction types
  - Remove reactions
  - Verify reaction counts update correctly

### 7. Events System

- **Scenario 7.1: Event Discovery**
  - Navigate to events section in a community
  - Browse existing events
  - Use filters to find specific events

- **Scenario 7.2: Event Creation**
  - Create a new community event
  - Test different event types (in-person, online, hybrid)
  - Verify successful event creation

- **Scenario 7.3: Event Participation**
  - RSVP to an event
  - Change RSVP status
  - Cancel attendance
  - Verify attendee list updates

## Data Collection

### Quantitative Metrics

Record the following metrics during testing:

1. **Task Completion Rate:**
   - Number of successful task completions
   - Time taken to complete each task

2. **Error Rate:**
   - Number of errors encountered
   - Types of errors (system errors, user errors)

3. **Navigation Paths:**
   - Number of clicks to complete tasks
   - Instances of navigational confusion

### Qualitative Feedback

Collect the following qualitative feedback:

1. **User Satisfaction:**
   - Rate each feature on a scale of 1-5
   - Overall satisfaction with the app

2. **Usability Issues:**
   - Points of confusion
   - Suggestions for improvement

3. **Feature Requests:**
   - Missing functionality
   - Enhancement ideas

## Feedback Collection Templates

### User Testing Checklist

```
[ ] Authentication Flow
    [ ] Registration
    [ ] Login
    [ ] Password Reset
[ ] Profile Management
    [ ] View Profile
    [ ] Edit Profile
    [ ] Privacy Settings
[ ] Matching and Discovery
    [ ] User Discovery
    [ ] Matching Process
    [ ] Match Management
[ ] Messaging System
    [ ] Start Conversation
    [ ] Real-time Messaging
    [ ] Message History
[ ] Community Features
    [ ] Community Discovery
    [ ] Community Creation
    [ ] Community Membership
[ ] Content Engagement
    [ ] Create Post
    [ ] Comment on Content
    [ ] Reactions
[ ] Events System
    [ ] Event Discovery
    [ ] Event Creation
    [ ] Event Participation
```

### Feature Feedback Form

```
Feature: [Feature Name]

Task Completion:
[ ] Completed without assistance
[ ] Completed with minor assistance
[ ] Completed with significant assistance
[ ] Failed to complete

Time to complete: ___ minutes

Usability Rating (1-5): ___

What worked well:
_______________________________

What was confusing:
_______________________________

Suggestions for improvement:
_______________________________
```

## Results Analysis

### Data Compilation

1. **Compile Test Results:**
   - Aggregate quantitative metrics
   - Categorize qualitative feedback
   - Identify common patterns

2. **Prioritize Issues:**
   - Critical (blocking user tasks)
   - Major (significant impact on UX)
   - Minor (annoyances or polish issues)

### Action Plan Development

1. **Short-term Fixes:**
   - Critical usability issues
   - Bug fixes
   - Performance improvements

2. **Medium-term Improvements:**
   - Feature enhancements
   - UX refinements
   - New feature development

## Iterative Testing

1. **Re-test After Changes:**
   - Focus on areas that had issues
   - Verify fixes resolve the identified problems

2. **Continuous Feedback Loop:**
   - Implement changes based on feedback
   - Conduct follow-up testing
   - Iterate on improvements

## Appendix: Test Data

### Sample Community Data

```
Community Name: Tech Enthusiasts
Description: A group for technology lovers to connect and share innovations.
Type: Public
Topics: Technology, Innovation, Gadgets

Community Name: Outdoor Adventures
Description: Connect with fellow outdoor enthusiasts for hikes, camping, and adventures.
Type: Public
Topics: Hiking, Camping, Nature
```

### Sample Event Data

```
Event Title: Tech Meetup 2025
Description: Join us for an evening of tech talks and networking.
Type: In-person
Location: Downtown Tech Hub
Date/Time: [Use current date + 7 days], 6:00 PM

Event Title: Virtual Game Night
Description: Online multiplayer games and socializing.
Type: Online
Platform: Zoom
Date/Time: [Use current date + 3 days], 8:00 PM
