"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CommunityAvatar from './CommunityAvatar';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    startTime: string;
    imageUrl?: string | null | undefined;
    location?: string;
    type?: string;
    status?: string;
    attendeeCount?: number;
    attendeeLimit?: number;
    category?: string;
    community?: {
      id: string;
      name: string;
      imageUrl?: string | null | undefined;
    };
  };
  className?: string;
}

const EventCard = ({ event, className = '' }: EventCardProps) => {
  const [imageError, setImageError] = useState(false);
  
  // Format date and time for display
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  // Get bg color based on event category
  const getCategoryColor = (category?: string) => {
    const colorMap: Record<string, string> = {
      'hobbies': 'bg-blue-600',
      'sports': 'bg-green-600',
      'arts': 'bg-purple-600',
      'technology': 'bg-indigo-600',
      'lifestyle': 'bg-pink-600',
      'health': 'bg-red-600',
      'education': 'bg-yellow-600',
      'travel': 'bg-teal-600',
      'food': 'bg-orange-600',
      'music': 'bg-violet-600',
      'gaming': 'bg-emerald-600',
      'professional': 'bg-slate-600',
      'local': 'bg-cyan-600',
      'support': 'bg-lime-600',
      'relationships': 'bg-rose-600'
    };
    
    return category && colorMap[category] ? colorMap[category] : 'bg-gradient-to-r from-blue-600 to-indigo-600';
  };
  
  // Handle image error
  const handleImageError = () => {
    setImageError(true);
  };
  
  // Generate event card heading with fallback for missing image
  const renderEventImage = () => {
    if (event.imageUrl && !imageError) {
      return (
        <Image
          src={event.imageUrl}
          alt={event.title}
          width={400}
          height={200}
          className="w-full h-full object-cover transition-transform hover:scale-105"
          onError={handleImageError}
          unoptimized
        />
      );
    }
    
    // Fallback to a colored background with event title
    return (
      <div className={`w-full h-full flex items-center justify-center ${getCategoryColor(event.category)}`}>
        <h3 className="text-white font-semibold text-lg p-4 text-center">
          {event.title}
        </h3>
      </div>
    );
  };

  return (
    <Link href={`/dashboard/events/${event.id}`} className={`block ${className}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden h-full transition-all hover:shadow-lg">
        {/* Event Image or Fallback */}
        <div className="h-40 overflow-hidden relative">
          {renderEventImage()}
          
          {/* Type/Status badge */}
          {event.type && (
            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              {event.type}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="flex items-center mb-2">
            {/* Community avatar */}
            {event.community && (
              <div className="mr-2">
                <CommunityAvatar 
                  src={event.community.imageUrl}
                  name={event.community.name}
                  size="sm"
                />
              </div>
            )}
            
            <div>
              <h3 className="font-bold text-lg line-clamp-1">{event.title}</h3>
              {event.community && (
                <p className="text-sm text-gray-600">by {event.community.name}</p>
              )}
            </div>
          </div>
          
          <p className="text-gray-700 text-sm mt-2 mb-3 line-clamp-2">
            {event.description}
          </p>
          
          {/* Date and time */}
          <div className="text-xs text-gray-600 flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatEventDate(event.startTime)}
          </div>
          
          {/* Location if available */}
          {event.location && (
            <div className="text-xs text-gray-600 flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
          
          {/* Attendee count */}
          {event.attendeeCount !== undefined && (
            <div className="text-xs text-gray-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {event.attendeeCount} {event.attendeeLimit ? `/ ${event.attendeeLimit}` : ''} attending
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
