"use client";

import React from 'react';

interface InterestsSectionProps {
  interests: string[];
  newInterest: string;
  isSubmitting: boolean;
  setNewInterest: (value: string) => void;
  handleAddInterest: () => void;
  handleRemoveInterest: (interest: string) => void;
}

export const InterestsSection: React.FC<InterestsSectionProps> = ({
  interests,
  newInterest,
  isSubmitting,
  setNewInterest,
  handleAddInterest,
  handleRemoveInterest
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Interests
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {interests.map((interest, index) => (
          <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
            <span className="text-sm">{interest}</span>
            <button
              type="button"
              className="ml-2 text-gray-500 hover:text-red-500"
              onClick={() => handleRemoveInterest(interest)}
              disabled={isSubmitting}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          className="flex-1 p-2 border border-gray-300 rounded-l-md"
          value={newInterest}
          onChange={(e) => setNewInterest(e.target.value)}
          placeholder="Add an interest"
          disabled={isSubmitting}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddInterest();
            }
          }}
        />
        <button
          type="button"
          className="bg-primary text-white px-4 py-2 rounded-r-md"
          onClick={handleAddInterest}
          disabled={isSubmitting}
        >
          Add
        </button>
      </div>
    </div>
  );
};
