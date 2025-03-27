'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import EventForm from '../../../../../../features/communities/components/EventForm';
import communityService from '../../../../../../services/api/community';

export default function CreateEventPage() {
  const params = useParams();
  const router = useRouter();
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

  const handleSuccess = () => {
    router.push(`/dashboard/communities/${communityId}/events`);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <Link 
          href={`/dashboard/communities/${communityId}/events`}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2 h-4 w-4" />
          Back to {isLoading ? 'Events' : `${communityName} Events`}
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Event</h1>
        <p className="text-gray-600 mt-1">
          {!isLoading && `Create a new event for ${communityName}`}
        </p>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      ) : (
        <EventForm communityId={communityId} onSuccess={handleSuccess} />
      )}
    </div>
  );
}
