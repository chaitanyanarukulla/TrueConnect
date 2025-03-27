'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import EventList from '../../../../../features/communities/components/EventList';
import communityService from '../../../../../services/api/community';

export default function CommunityEventsPage() {
  const params = useParams();
  const communityId = params.id as string;
  const [communityName, setCommunityName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunityDetails = async () => {
      try {
        setIsLoading(true);
        const communityData = await communityService.getCommunity(communityId);
        setCommunityName(communityData.name);
      } catch (err) {
        console.error('Failed to fetch community details:', err);
        setError('Failed to load community details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunityDetails();
  }, [communityId]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <Link 
          href={`/dashboard/communities/${communityId}`}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2 h-4 w-4" />
          Back to {isLoading ? 'Community' : communityName}
        </Link>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      ) : (
        <EventList communityId={communityId} />
      )}
    </div>
  );
}
