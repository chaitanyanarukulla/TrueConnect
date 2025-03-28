"use client";

import React from 'react';

interface PersonalityTraitsSectionProps {
  personality: string[];
  isSubmitting: boolean;
  setPersonality: (value: string[]) => void;
}

export const PersonalityTraitsSection: React.FC<PersonalityTraitsSectionProps> = ({
  personality,
  isSubmitting,
  setPersonality
}) => {
  const personalityOptions = [
    "Outgoing", 
    "Introverted", 
    "Creative", 
    "Analytical", 
    "Adventurous", 
    "Relaxed", 
    "Organized", 
    "Spontaneous", 
    "Ambitious", 
    "Laid-back"
  ];

  return (
    <div className="border-t border-gray-200 pt-4 mt-6 mb-4">
      <h3 className="text-lg font-semibold mb-4">Personality Traits</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        {personalityOptions.map((trait) => (
          <button
            key={trait}
            type="button"
            className={`px-3 py-1 rounded-full text-sm ${
              personality.includes(trait) 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => {
              if (personality.includes(trait)) {
                setPersonality(personality.filter(t => t !== trait));
              } else if (personality.length < 5) {
                setPersonality([...personality, trait]);
              }
            }}
            disabled={isSubmitting || (personality.length >= 5 && !personality.includes(trait))}
          >
            {trait}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mb-4">Select traits that describe you (up to 5)</p>
    </div>
  );
};
