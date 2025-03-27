"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import communityService, { Community, CommunityMember } from '@/services/api/community';

interface CommunityDetailPageProps {
  params: {
    id: string;
  };
}

const CommunityDetailPage = ({ params }: CommunityDetailPageProps) => {
  const router = useRouter();
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'about' | 'members' | 'events' | 'posts'>('about');
  const [isMember, setIsMember] = useState<boolean>(false);
  const [joiningOrLeaving, setJoiningOrLeaving] = useState<boolean>(false);

  // Fetch community and check membership
  useEffect(() => {
    const fetchCommunityData = async () => {
      setLoading(true);
      try {
        // Get community details
        const communityData = await communityService.getCommunity(params.id);
        setCommunity(communityData);
        
        // Get community members
        const membersResponse = await communityService.getCommunityMembers(params.id);
        setMembers(membersResponse.data);
        
        // Check if current user is a member
        const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').id : null;
        if (userId) {
          const userIsMember = membersResponse.data.some(
            (member) => member.userId === userId && member.isActive
          );
          setIsMember(userIsMember);
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to load community:', err);
        setError('Failed to load community data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, [params.id]);

  // Join community
  const handleJoin = async () => {
    setJoiningOrLeaving(true);
    try {
      await communityService.joinCommunity(params.id);
      setIsMember(true);
      
      // Refresh members list
      const membersResponse = await communityService.getCommunityMembers(params.id);
      setMembers(membersResponse.data);
    } catch (err) {
      console.error('Failed to join community:', err);
      setError('Failed to join community. Please try again.');
    } finally {
      setJoiningOrLeaving(false);
    }
  };

  // Leave community
  const handleLeave = async () => {
    setJoiningOrLeaving(true);
    try {
      await communityService.leaveCommunity(params.id);
      setIsMember(false);
      
      // Refresh members list
      const membersResponse = await communityService.getCommunityMembers(params.id);
      setMembers(membersResponse.data);
    } catch (err) {
      console.error('Failed to leave community:', err);
      setError('Failed to leave community. Please try again.');
    } finally {
      setJoiningOrLeaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
          <button 
            onClick={() => router.refresh()}
            className="ml-4 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Not found state
  if (!community) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Community Not Found</h1>
          <p className="text-gray-600 mb-6">The community you're looking for doesn't exist or has been removed.</p>
          <Link href="/dashboard/communities" className="text-primary hover:underline">
            Back to Communities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Community Header */}
      <div className="relative">
        <div 
          className="h-48 w-full bg-gray-200 rounded-t-lg bg-cover bg-center"
          style={{ backgroundImage: community.coverImageUrl ? `url(${community.coverImageUrl})` : undefined }}
        ></div>
        <div className="absolute -bottom-16 left-8">
          <div className="w-32 h-32 rounded-full bg-white p-1">
            <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden">
              {community.imageUrl ? (
                <img 
                  src={community.imageUrl} 
                  alt={community.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-white text-4xl font-bold">
                  {community.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Community Info */}
      <div className="mt-20 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{community.name}</h1>
          <div className="flex items-center mt-2 text-gray-600">
            <span className="mr-4">{community.memberCount} members</span>
            {community.category && (
              <span className="mr-4 bg-gray-100 px-2 py-1 rounded-full text-sm">
                {community.category}
              </span>
            )}
            {community.isPrivate && (
              <span className="bg-gray-100 px-2 py-1 rounded-full text-sm">
                Private
              </span>
            )}
          </div>
        </div>
        <div className="mt-4 md:mt-0">
          {isMember ? (
            <button
              onClick={handleLeave}
              disabled={joiningOrLeaving}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              {joiningOrLeaving ? 'Leaving...' : 'Leave Community'}
            </button>
          ) : (
            <button
              onClick={handleJoin}
              disabled={joiningOrLeaving}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              {joiningOrLeaving ? 'Joining...' : 'Join Community'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mt-8 mb-6">
        <button
          className={`py-2 px-4 ${activeTab === 'about' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          onClick={() => setActiveTab('about')}
        >
          About
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'members' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          onClick={() => setActiveTab('members')}
        >
          Members
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'events' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          onClick={() => setActiveTab('events')}
        >
          Events
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'posts' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
      </div>

      {/* Tab Content */}
      <div className="py-4">
        {/* About Tab */}
        {activeTab === 'about' && (
          <div>
            <h2 className="text-xl font-bold mb-4">About this Community</h2>
            <p className="text-gray-700 mb-6">{community.description}</p>
            
            {community.tags && community.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {community.tags.map((tag) => (
                    <span key={tag} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Community Info</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-2">
                  <span className="font-medium">Created: </span>
                  {new Date(community.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Type: </span>
                  {community.isPrivate ? 'Private Community' : 'Public Community'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Community Members</h2>
            {members.length === 0 ? (
              <p className="text-gray-500">No members found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center p-3 border rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-4">
                      {member.user?.profilePhoto ? (
                        <img 
                          src={member.user.profilePhoto} 
                          alt={`${member.user.firstName} ${member.user.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary text-white text-lg font-bold">
                          {member.user?.firstName?.charAt(0)}
                          {member.user?.lastName?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {member.user?.firstName} {member.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {member.role} {member.customTitle && `• ${member.customTitle}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Events Tab (Placeholder) */}
        {activeTab === 'events' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Community Events</h2>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-500">Events feature coming soon!</p>
            </div>
          </div>
        )}

        {/* Posts Tab (Placeholder) */}
        {activeTab === 'posts' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Community Posts</h2>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-500">Posts feature coming soon!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityDetailPage;
