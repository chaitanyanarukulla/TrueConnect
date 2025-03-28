import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaHeart, FaRegHeart, FaMapMarkerAlt, FaUser, FaStar } from 'react-icons/fa';
import { UserProfile } from '@/services/api/profile-discovery';

interface ProfileCardProps {
  profile: UserProfile;
  className?: string;
  onLike?: (profileId: string) => void;
  isLiked?: boolean;
  showCompatibility?: boolean;
  showDistance?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  profile, 
  className = '', 
  onLike, 
  isLiked = false,
  showCompatibility = false,
  showDistance = false,
}) => {
  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onLike) {
      onLike(profile.id);
    }
  };
  
  // Extract only first name for display
  const firstName = profile.name.split(' ')[0];
  
  // Format age
  const age = profile.age || null;
  
  // Get location
  const location = profile.location || null;
  
  // Determine if we have enough information to show the profile
  const hasBasicInfo = firstName && (age || (profile.interests && profile.interests.length > 0));
  
  return (
    <Link href={`/dashboard/profiles/${profile.id}`}>
      <div className={`overflow-hidden rounded-lg shadow-lg bg-white cursor-pointer transition-all hover:shadow-xl ${className}`}>
        {/* Profile Image */}
        <div className="relative h-64 w-full overflow-hidden bg-gray-200">
          {profile.profilePicture ? (
            <Image
              src={profile.profilePicture}
              alt={profile.name}
              fill
              style={{ objectFit: 'cover' }}
              className="transition-transform hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <FaUser className="h-20 w-20 text-gray-400" />
            </div>
          )}
          
          {/* Like Button */}
          {onLike && (
            <button
              onClick={handleLikeClick}
              className="absolute top-3 right-3 p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 shadow transition-all hover:scale-110"
            >
              {isLiked ? (
                <FaHeart className="h-5 w-5 text-red-500" />
              ) : (
                <FaRegHeart className="h-5 w-5 text-gray-700" />
              )}
            </button>
          )}
          
          {/* Compatibility Score */}
          {showCompatibility && profile.compatibilityScore && (
            <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-white bg-opacity-80 flex items-center">
              <FaStar className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium">{Math.round(profile.compatibilityScore.overall * 100)}% Match</span>
            </div>
          )}
        </div>
        
        {/* Profile Info */}
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {firstName}
                {age && <span className="ml-2 text-gray-600">{age}</span>}
              </h3>
            </div>
            
            {/* Distance */}
            {showDistance && profile.distance !== undefined && (
              <div className="flex items-center text-gray-600">
                <FaMapMarkerAlt className="h-3 w-3 mr-1" />
                <span className="text-xs">{profile.distance.toFixed(1)} km</span>
              </div>
            )}
          </div>
          
          {/* Location */}
          {location && (
            <div className="flex items-center mt-1 text-gray-600">
              <FaMapMarkerAlt className="h-3 w-3 mr-1" />
              <span className="text-sm">{location}</span>
            </div>
          )}
          
          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1">
                {profile.interests.slice(0, 3).map((interest, index) => (
                  <span 
                    key={index} 
                    className="inline-block px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700"
                  >
                    {interest}
                  </span>
                ))}
                {profile.interests.length > 3 && (
                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                    +{profile.interests.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Bio Preview */}
          {profile.bio && (
            <p className="mt-3 text-sm text-gray-600 line-clamp-2">
              {profile.bio}
            </p>
          )}
          
          {/* Relationship Type */}
          {profile.relationshipType && (
            <div className="mt-2">
              <span className="inline-block px-2 py-1 text-xs rounded-full bg-pink-50 text-pink-700">
                Looking for: {profile.relationshipType}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProfileCard;
