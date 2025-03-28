"use client";

import React from 'react';

interface FuturePlansSectionProps {
  wantChildren: string;
  isSubmitting: boolean;
  setWantChildren: (value: string) => void;
}

export const FuturePlansSection: React.FC<FuturePlansSectionProps> = ({
  wantChildren,
  isSubmitting,
  setWantChildren
}) => {
  return (
    <div className="border-t border-gray-200 pt-4 mt-6 mb-4">
      <h3 className="text-lg font-semibold mb-4">Future Plans</h3>
      
      <div className="mb-4">
        <label htmlFor="wantChildren" className="block text-sm font-medium text-gray-700 mb-1">
          Wanting Children
        </label>
        <select
          id="wantChildren"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={wantChildren}
          onChange={(e) => setWantChildren(e.target.value)}
          disabled={isSubmitting}
        >
          <option value="">Prefer not to say</option>
          <option value="want">Want children</option>
          <option value="dont-want">Don't want children</option>
          <option value="have-and-want-more">Have children and want more</option>
          <option value="have-and-dont-want-more">Have children and don't want more</option>
          <option value="not-sure">Not sure yet</option>
        </select>
      </div>
    </div>
  );
};
