"use client";

import React from 'react';

interface LifestyleSectionProps {
  smoking: string;
  drinking: string;
  diet: string;
  exercise: string;
  isSubmitting: boolean;
  setSmoking: (value: string) => void;
  setDrinking: (value: string) => void;
  setDiet: (value: string) => void;
  setExercise: (value: string) => void;
}

export const LifestyleSection: React.FC<LifestyleSectionProps> = ({
  smoking,
  drinking,
  diet,
  exercise,
  isSubmitting,
  setSmoking,
  setDrinking,
  setDiet,
  setExercise
}) => {
  return (
    <div className="border-t border-gray-200 pt-4 mt-6 mb-4">
      <h3 className="text-lg font-semibold mb-4">Lifestyle</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="smoking" className="block text-sm font-medium text-gray-700 mb-1">
            Smoking
          </label>
          <select
            id="smoking"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={smoking}
            onChange={(e) => setSmoking(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">Prefer not to say</option>
            <option value="non-smoker">Non-smoker</option>
            <option value="occasional">Smoke occasionally</option>
            <option value="regular">Regular smoker</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="drinking" className="block text-sm font-medium text-gray-700 mb-1">
            Drinking
          </label>
          <select
            id="drinking"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={drinking}
            onChange={(e) => setDrinking(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">Prefer not to say</option>
            <option value="non-drinker">Don't drink</option>
            <option value="social">Social drinker</option>
            <option value="regular">Regular drinker</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="diet" className="block text-sm font-medium text-gray-700 mb-1">
            Diet
          </label>
          <select
            id="diet"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={diet}
            onChange={(e) => setDiet(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">Prefer not to say</option>
            <option value="omnivore">Omnivore</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="pescatarian">Pescatarian</option>
            <option value="keto">Keto</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="exercise" className="block text-sm font-medium text-gray-700 mb-1">
            Exercise
          </label>
          <select
            id="exercise"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">Prefer not to say</option>
            <option value="rarely">Rarely</option>
            <option value="sometimes">Sometimes</option>
            <option value="regularly">Regularly</option>
            <option value="daily">Daily</option>
          </select>
        </div>
      </div>
    </div>
  );
};
