"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import communityService, { Community, PaginatedResponse } from '@/services/api/community';
import { CommunityCategory } from '@/modules/communities/dto/create-community.dto';

const CommunitiesPage = () => {
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'discover' | 'my'>('discover');
  const [page, setPage] = useState<number>(1);
  const [filter, setFilter] = useState<string>('');
  const [category, setCategory] = useState<CommunityCategory | ''>('');
  const [totalPages, setTotalPages] = useState<number>(1);

  // Fetch communities based on active tab
  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true);
      try {
        let response: PaginatedResponse<Community>;
        
        if (activeTab === 'discover') {
          response = await communityService.getCommunities(page, 10, filter, category);
        } else {
          response = await communityService.getMyCommunities(page, 10);
        }
        
        if (activeTab === 'discover') {
          setCommunities(response.data);
        } else {
          setMyCommunities(response.data);
        }
        
        setTotalPages(response.meta.pages);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch communities:', err);
        setError('Failed to load communities. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, [activeTab, page, filter, category]);

  // Handle search
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
  };

  // Handle category filter change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCategory(value === '' ? '' : value as CommunityCategory);
    setPage(1); // Reset to first page when changing category
  };

  // Navigate to create community page
  const goToCreateCommunity = () => {
    router.push('/dashboard/communities/create');
  };

  // Helper function to render community cards
  const renderCommunityCards = (data: Community[]) => {
    if (data.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-500">No communities found</p>
          {activeTab === 'my' && (
            <button 
              onClick={goToCreateCommunity}
              className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
            >
              Create Your First Community
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((community) => (
          <div key={community.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div 
              className="h-32 bg-gray-200 bg-cover bg-center"
              style={{ backgroundImage: community.coverImageUrl ? `url(${community.coverImageUrl})` : undefined }}
            ></div>
            <div className="p-5">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden mr-3">
                  {community.imageUrl && (
                    <img 
                      src={community.imageUrl} 
                      alt={community.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{community.name}</h3>
                  <p className="text-gray-500 text-sm">{community.memberCount} members</p>
                </div>
              </div>
              <p className="text-gray-700 line-clamp-2 mb-3">{community.description}</p>
              <div className="flex justify-between items-center">
                <div className="flex">
                  {community.category && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mr-2">
                      {community.category}
                    </span>
                  )}
                  {community.isPrivate && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                      Private
                    </span>
                  )}
                </div>
                <Link
                  href={`/dashboard/communities/${community.id}`}
                  className="text-primary hover:underline text-sm"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Communities</h1>
        <button
          onClick={goToCreateCommunity}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          Create Community
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 ${activeTab === 'discover' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          onClick={() => setActiveTab('discover')}
        >
          Discover
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'my' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          onClick={() => setActiveTab('my')}
        >
          My Communities
        </button>
      </div>

      {/* Search and filters (only for discover tab) */}
      {activeTab === 'discover' && (
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search communities..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-2 text-gray-400 hover:text-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
          <div className="w-full md:w-48">
            <select
              className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              value={category}
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>
              {Object.values(CommunityCategory).map((catValue) => (
                <option key={catValue} value={catValue}>
                  {catValue.charAt(0).toUpperCase() + catValue.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Community grid */}
          {renderCommunityCards(activeTab === 'discover' ? communities : myCommunities)}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-lg ${
                    page === 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>
                <div className="px-4 py-2 bg-gray-100 rounded-lg">
                  Page {page} of {totalPages}
                </div>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded-lg ${
                    page === totalPages
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommunitiesPage;
