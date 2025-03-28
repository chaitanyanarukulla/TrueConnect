"use client";

import React from 'react';
import ProfileImage from '@/components/ui/ProfileImage';
import { useAuth } from '@/context/AuthContext';

interface ProfilePhotoSectionProps {
  profile: any;
  isSubmitting: boolean;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export const ProfilePhotoSection: React.FC<ProfilePhotoSectionProps> = ({
  profile,
  isSubmitting,
  onPhotoUpload
}) => {
  const { user } = useAuth();
  
  return (
    <div className="w-full md:w-1/3">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          <ProfileImage 
            src={profile?.profilePicture} 
            alt={user?.name || "Profile"} 
            size="xl"
            className="mb-4"
          />
          
          <div className="w-full">
            <label className="btn-outline w-full block text-center py-2 px-4 cursor-pointer">
              Upload Photo
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={onPhotoUpload}
                disabled={isSubmitting}
              />
            </label>
          </div>
          
          <div className="mt-6 w-full">
            <h3 className="text-lg font-semibold mb-2">{user?.name}</h3>
            <p className="text-gray-600 text-sm mb-1">
              {profile?.email}
            </p>
            {profile?.location && (
              <p className="text-gray-600 text-sm">
                {profile.location}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
