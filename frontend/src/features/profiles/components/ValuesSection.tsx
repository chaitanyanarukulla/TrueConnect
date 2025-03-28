"use client";

import React from 'react';

interface ValuesSectionProps {
  values: string[];
  isSubmitting: boolean;
  setValues: (value: string[]) => void;
}

export const ValuesSection: React.FC<ValuesSectionProps> = ({
  values,
  isSubmitting,
  setValues
}) => {
  const valueOptions = [
    "Family", 
    "Career", 
    "Friendship", 
    "Health", 
    "Learning", 
    "Adventure", 
    "Spirituality", 
    "Creativity", 
    "Community", 
    "Nature"
  ];

  return (
    <div className="border-t border-gray-200 pt-4 mt-2 mb-4">
      <h3 className="text-lg font-semibold mb-4">Values</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        {valueOptions.map((value) => (
          <button
            key={value}
            type="button"
            className={`px-3 py-1 rounded-full text-sm ${
              values.includes(value) 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => {
              if (values.includes(value)) {
                setValues(values.filter(v => v !== value));
              } else if (values.length < 5) {
                setValues([...values, value]);
              }
            }}
            disabled={isSubmitting || (values.length >= 5 && !values.includes(value))}
          >
            {value}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mb-4">Select values that are important to you (up to 5)</p>
    </div>
  );
};
