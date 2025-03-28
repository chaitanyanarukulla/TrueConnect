"use client";

import React from 'react';

interface ReligionCultureSectionProps {
  religion: string;
  religiousImportance: string;
  languages: string[];
  newLanguage: string;
  isSubmitting: boolean;
  setReligion: (value: string) => void;
  setReligiousImportance: (value: string) => void;
  setNewLanguage: (value: string) => void;
  handleAddLanguage: () => void;
  handleRemoveLanguage: (language: string) => void;
}

export const ReligionCultureSection: React.FC<ReligionCultureSectionProps> = ({
  religion,
  religiousImportance,
  languages,
  newLanguage,
  isSubmitting,
  setReligion,
  setReligiousImportance,
  setNewLanguage,
  handleAddLanguage,
  handleRemoveLanguage
}) => {
  return (
    <div className="border-t border-gray-200 pt-4 mt-6 mb-4">
      <h3 className="text-lg font-semibold mb-4">Religion & Culture</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="religion" className="block text-sm font-medium text-gray-700 mb-1">
            Religion/Spirituality
          </label>
          <select
            id="religion"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={religion}
            onChange={(e) => setReligion(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">Prefer not to say</option>
            <option value="agnostic">Agnostic</option>
            <option value="atheist">Atheist</option>
            <option value="buddhist">Buddhist</option>
            <option value="christian">Christian</option>
            <option value="hindu">Hindu</option>
            <option value="jewish">Jewish</option>
            <option value="muslim">Muslim</option>
            <option value="spiritual">Spiritual but not religious</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="religiousImportance" className="block text-sm font-medium text-gray-700 mb-1">
            Importance in your life
          </label>
          <select
            id="religiousImportance"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={religiousImportance}
            onChange={(e) => setReligiousImportance(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">Prefer not to say</option>
            <option value="not-important">Not important</option>
            <option value="somewhat-important">Somewhat important</option>
            <option value="important">Important</option>
            <option value="very-important">Very important</option>
          </select>
        </div>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Languages Spoken
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {languages.map((language, index) => (
            <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
              <span className="text-sm">{language}</span>
              <button
                type="button"
                className="ml-2 text-gray-500 hover:text-red-500"
                onClick={() => handleRemoveLanguage(language)}
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
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            placeholder="Add a language"
            disabled={isSubmitting}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddLanguage();
              }
            }}
          />
          <button
            type="button"
            className="bg-primary text-white px-4 py-2 rounded-r-md"
            onClick={handleAddLanguage}
            disabled={isSubmitting}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
