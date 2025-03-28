"use client";

import React from 'react';

interface PetPreferencesSectionProps {
  petPreferences: string[];
  isSubmitting: boolean;
  setPetPreferences: (value: string[]) => void;
}

export const PetPreferencesSection: React.FC<PetPreferencesSectionProps> = ({
  petPreferences,
  isSubmitting,
  setPetPreferences
}) => {
  const petOptions = [
    "Have dogs", 
    "Have cats", 
    "Have other pets", 
    "Love dogs", 
    "Love cats", 
    "Allergic to pets", 
    "Prefer no pets"
  ];

  return (
    <div className="border-t border-gray-200 pt-4 mt-6 mb-4">
      <h3 className="text-lg font-semibold mb-4">Pet Preferences</h3>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {petOptions.map((pet) => (
          <button
            key={pet}
            type="button"
            className={`px-3 py-1 rounded-full text-sm ${
              petPreferences.includes(pet) 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => {
              if (petPreferences.includes(pet)) {
                setPetPreferences(petPreferences.filter(p => p !== pet));
              } else {
                setPetPreferences([...petPreferences, pet]);
              }
            }}
            disabled={isSubmitting}
          >
            {pet}
          </button>
        ))}
      </div>
    </div>
  );
};
