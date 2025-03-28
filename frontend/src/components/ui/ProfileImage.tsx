"use client";

import { useState } from 'react';
import Image from 'next/image';

interface ProfileImageProps {
  src: string | null | undefined;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  border?: boolean;
  onClick?: () => void;
}

const ProfileImage = ({ 
  src, 
  alt, 
  size = 'md', 
  className = '',
  border = false,
  onClick
}: ProfileImageProps) => {
  const [error, setError] = useState(false);
  
  // Size mappings
  const sizeMap = {
    sm: { container: 'w-10 h-10', fontSize: 'text-xl' },
    md: { container: 'w-16 h-16', fontSize: 'text-2xl' },
    lg: { container: 'w-24 h-24', fontSize: 'text-3xl' },
    xl: { container: 'w-40 h-40', fontSize: 'text-5xl' },
  };
  
  const containerClasses = `relative overflow-hidden rounded-full bg-gray-200 flex items-center justify-center ${sizeMap[size].container} ${border ? 'border-2 border-primary' : ''} ${className} ${onClick ? 'cursor-pointer' : ''}`;
  
  // Generate initials from alt text
  const initials = alt
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
  
  // Handle image loading errors
  const handleError = () => {
    setError(true);
  };
  
  // Use a basic avatar if image fails to load
  const renderInitialsAvatar = () => (
    <span className={`text-gray-500 font-medium ${sizeMap[size].fontSize}`}>
      {initials || '?'}
    </span>
  );
  
  return (
    <div className={containerClasses} onClick={onClick}>
      {src && !error ? (
        <div className="w-full h-full">
          <Image
            src={src}
            alt={alt}
            width={500}
            height={500}
            className="w-full h-full object-cover"
            onError={handleError}
            unoptimized // Skip Next.js image optimization for external images
          />
        </div>
      ) : renderInitialsAvatar()}
    </div>
  );
};

export default ProfileImage;
