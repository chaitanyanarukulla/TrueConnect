"use client";

import React from 'react';

interface RelationshipStyleSectionProps {
  communicationStyle: string;
  loveLanguages: string[];
  isSubmitting: boolean;
  setCommunicationStyle: (value: string) => void;
  setLoveLanguages: (value: string[]) => void;
}

export const RelationshipStyleSection: React.FC<RelationshipStyleSectionProps> = ({
  communicationStyle,
  loveLanguages,
  isSubmitting,
  setCommunicationStyle,
  setLoveLanguages
}) => {
  const loveLanguageOptions = [
    "Words of Affirmation", 
    "Quality Time", 
    "Physical Touch", 
    "Acts of Service", 
    "Receiving Gifts"
  ];

  return (
    <div className="border-t border-gray-200 pt-4 mt-6 mb-4">
      <h3 className="text-lg font-semibold mb-4">Relationship Style</h3>
      
      <div className="mb-4">
        <label htmlFor="communicationStyle" className="block text-sm font-medium text-gray-700 mb-1">
          Communication Style
        </label>
        <select
          id="communicationStyle"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={communicationStyle}
          onChange={(e) => setCommunicationStyle(e.target.value)}
          disabled={isSubmitting}
        >
          <option value="">Prefer not to say</option>
          <option value="direct">Direct communicator</option>
          <option value="indirect">Indirect communicator</option>
          <option value="reserved">Reserved, need time to open up</option>
          <option value="expressive">Expressive, share feelings easily</option>
          <option value="logical">Logical, focus on facts</option>
          <option value="emotional">Emotional, focus on feelings</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Love Languages
        </label>
        <p className="text-xs text-gray-500 mb-2">How do you prefer to give and receive love? (Select up to 2)</p>
        <div className="flex flex-wrap gap-2">
          {loveLanguageOptions.map((language) => (
            <button
              key={language}
              type="button"
              className={`px-3 py-1 rounded-full text-sm ${
                loveLanguages.includes(language) 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => {
                if (loveLanguages.includes(language)) {
                  setLoveLanguages(loveLanguages.filter(l => l !== language));
                } else if (loveLanguages.length < 2) {
                  setLoveLanguages([...loveLanguages, language]);
                }
              }}
              disabled={isSubmitting || (loveLanguages.length >= 2 && !loveLanguages.includes(language))}
            >
              {language}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
