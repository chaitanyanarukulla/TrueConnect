"use client";

import React from 'react';

interface BasicInfoSectionProps {
  bio: string;
  location: string;
  lookingFor: string;
  relationshipType: string;
  occupation: string;
  education: string;
  isSubmitting: boolean;
  setBio: (value: string) => void;
  setLocation: (value: string) => void;
  setLookingFor: (value: string) => void;
  setRelationshipType: (value: string) => void;
  setOccupation: (value: string) => void;
  setEducation: (value: string) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  bio,
  location,
  lookingFor,
  relationshipType,
  occupation,
  education,
  isSubmitting,
  setBio,
  setLocation,
  setLookingFor,
  setRelationshipType,
  setOccupation,
  setEducation
}) => {
  return (
    <>
      <div className="mb-4">
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
          Bio
        </label>
        <textarea
          id="bio"
          rows={4}
          className="w-full p-2 border border-gray-300 rounded-md"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          disabled={isSubmitting}
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <input
          id="location"
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Your city, country"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="lookingFor" className="block text-sm font-medium text-gray-700 mb-1">
          Looking For
        </label>
        <textarea
          id="lookingFor"
          rows={2}
          className="w-full p-2 border border-gray-300 rounded-md"
          value={lookingFor}
          onChange={(e) => setLookingFor(e.target.value)}
          placeholder="What are you looking for in a relationship?"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="relationshipType" className="block text-sm font-medium text-gray-700 mb-1">
          Relationship Type
        </label>
        <select
          id="relationshipType"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={relationshipType}
          onChange={(e) => setRelationshipType(e.target.value)}
          disabled={isSubmitting}
        >
          <option value="">Select an option</option>
          <option value="casual">Casual dating</option>
          <option value="long-term">Long-term relationship</option>
          <option value="friendship">Friendship</option>
          <option value="marriage">Marriage-minded</option>
          <option value="unsure">Still figuring it out</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">
          Occupation
        </label>
        <input
          id="occupation"
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
          placeholder="What do you do?"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
          Education
        </label>
        <input
          id="education"
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={education}
          onChange={(e) => setEducation(e.target.value)}
          placeholder="Your education background"
          disabled={isSubmitting}
        />
      </div>
    </>
  );
};
