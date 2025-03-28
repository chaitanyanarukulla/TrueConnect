"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { 
  FaCalendarAlt, FaHeart, FaUsers, FaComments, 
  FaChevronRight, FaBell, FaMapMarkerAlt, 
  FaFire, FaStar, FaUserFriends, FaClock
} from "react-icons/fa";
import eventService, { Event } from "@/services/api/event";
import { matchService, MatchData } from "@/services/api/match";
import communityService, { Community } from "@/services/api/community";
import messageService from "@/services/api/message";
import { format } from "date-fns";

// Calculate profile completion percentage
const calculateProfileCompletion = (user: any): number => {
  if (!user) return 0;
  
  const requiredFields = [
    'name',
    'email',
    'profilePicture',
    'bio',
    'birthdate',
    'location',
    'interests',
    'relationshipType',
    'occupation',
    'lifestyle',
    'personality',
    'values'
  ];
  
  // Check profile values
  const profile = user.profile || user;
  let filledFields = 0;
  
  requiredFields.forEach(field => {
    if (profile[field]) {
      // For arrays, check if they have at least one item
      if (Array.isArray(profile[field])) {
        if (profile[field].length > 0) filledFields++;
      } 
      // For objects, check if they have at least one property with value
      else if (typeof profile[field] === 'object' && profile[field] !== null) {
        if (Object.values(profile[field]).some(val => val)) filledFields++;
      }
      // For simple fields, just check if they exist
      else {
        filledFields++;
      }
    }
  });
  
  // Calculate percentage
  return Math.round((filledFields / requiredFields.length) * 100);
};

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [recentMatches, setRecentMatches] = useState<MatchData[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [activeConversations, setActiveConversations] = useState<any[]>([]);
  const [suggestedCommunities, setSuggestedCommunities] = useState<Community[]>([]);
  const [dataLoading, setDataLoading] = useState({
    matches: true,
    events: true,
    messages: true,
    communities: true
  });

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    // Only fetch data if authenticated
    if (!isAuthenticated) return;
    
    // Fetch user's recent matches
    const fetchRecentMatches = async () => {
      try {
        const data = await matchService.getUserMatches();
        setRecentMatches(data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setDataLoading(prev => ({ ...prev, matches: false }));
      }
    };

    // Fetch upcoming events
    const fetchUpcomingEvents = async () => {
      try {
        const result = await eventService.discoverEvents({ 
          upcoming: true, 
          limit: 3,
          sort: 'date'
        });
        setUpcomingEvents(result.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setDataLoading(prev => ({ ...prev, events: false }));
      }
    };

    // Fetch active conversations
    const fetchActiveConversations = async () => {
      try {
        const result = await messageService.getConversations(1, 3);
        setActiveConversations(result.data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setDataLoading(prev => ({ ...prev, messages: false }));
      }
    };

    // Fetch suggested communities
    const fetchSuggestedCommunities = async () => {
      try {
        const result = await communityService.getCommunities(1, 3);
        setSuggestedCommunities(result.data);
      } catch (error) {
        console.error('Error fetching communities:', error);
      } finally {
        setDataLoading(prev => ({ ...prev, communities: false }));
      }
    };

    fetchRecentMatches();
    fetchUpcomingEvents();
    fetchActiveConversations();
    fetchSuggestedCommunities();
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isAllDataLoading = Object.values(dataLoading).some(status => status);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-indigo-700 rounded-xl shadow-lg mb-6 p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
            <p className="mt-2 text-indigo-100">Here's what's happening in your TrueConnect world today</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center">
            <div className="bg-white/20 rounded-lg py-2 px-4 mr-4">
              <div className="text-xs text-indigo-100">Profile Completion</div>
              <div className="flex items-center">
                <div className="text-2xl font-bold mr-2">{calculateProfileCompletion(user)}%</div>
                <div className="relative h-2 w-12 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-white" 
                    style={{ width: `${calculateProfileCompletion(user)}%` }} 
                  />
                </div>
              </div>
            </div>
            <Link 
              href="/dashboard/profile" 
              className="bg-white text-primary hover:bg-indigo-50 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {calculateProfileCompletion(user) < 100 ? 'Complete Profile' : 'Edit Profile'}
            </Link>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="bg-white/20 rounded-full p-2 mr-3">
                <FaHeart className="h-5 w-5 text-pink-200" />
              </div>
              <div>
                <div className="text-xs text-indigo-100">Matches</div>
                <div className="text-xl font-bold">
                  <Link href="/dashboard/matches" className="hover:underline">
                    {recentMatches?.length || 0}
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="bg-white/20 rounded-full p-2 mr-3">
                <FaComments className="h-5 w-5 text-blue-200" />
              </div>
              <div>
                <div className="text-xs text-indigo-100">Messages</div>
                <div className="text-xl font-bold">18</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="bg-white/20 rounded-full p-2 mr-3">
                <FaUsers className="h-5 w-5 text-green-200" />
              </div>
              <div>
                <div className="text-xs text-indigo-100">Communities</div>
                <div className="text-xl font-bold">5</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="bg-white/20 rounded-full p-2 mr-3">
                <FaCalendarAlt className="h-5 w-5 text-yellow-200" />
              </div>
              <div>
                <div className="text-xs text-indigo-100">Events</div>
                <div className="text-xl font-bold">7</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Dashboard Content - 2x2 Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Matches */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
          <div className="px-6 py-4 bg-gradient-to-r from-pink-500 to-red-500">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center">
                <FaHeart className="mr-2" /> Recent Matches
              </h2>
              <Link href="/dashboard/matches" className="text-xs text-white flex items-center hover:underline">
                View All <FaChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </div>
          
          <div className="p-4">
            {dataLoading.matches ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
              </div>
            ) : recentMatches.length > 0 ? (
              <div className="space-y-4">
                {recentMatches.map((match, index) => (
                  <Link 
                    href={`/dashboard/matches/${match.matchId}`} 
                    key={index}
                    className="flex items-center p-3 hover:bg-pink-50 rounded-lg transition-colors"
                  >
                    <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden mr-4">
                      {match.user.profilePicture ? (
                        <img 
                          src={match.user.profilePicture} 
                          alt={match.user.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-pink-400 to-red-400 text-white font-bold text-lg">
                          {match.user.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{match.user.name}</h3>
                      <p className="text-sm text-gray-500">{match.createdAt ? `Matched ${format(new Date(match.createdAt), 'MMM d')}` : 'New match!'}</p>
                    </div>
                    <div className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                      {match.compatibilityScore?.overall ? `${Math.round(match.compatibilityScore.overall * 100)}%` : '87%'} Match
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4">
                <FaHeart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No matches yet</h3>
                <p className="text-gray-500 mt-2">Start discovering potential matches that align with your interests.</p>
                <Link 
                  href="/dashboard/discover" 
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700"
                >
                  Find Matches
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
          <div className="px-6 py-4 bg-gradient-to-r from-yellow-400 to-amber-500">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center">
                <FaCalendarAlt className="mr-2" /> Upcoming Events
              </h2>
              <Link href="/dashboard/discover" className="text-xs text-white flex items-center hover:underline">
                View All <FaChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </div>
          
          <div className="p-4">
            {dataLoading.events ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <Link 
                    href={`/dashboard/communities/${event.communityId}/events/${event.id}`} 
                    key={index}
                    className="block p-3 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center mb-2">
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-amber-100 text-amber-800 mr-3">
                        <FaCalendarAlt />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 line-clamp-1">{event.title}</h3>
                        <p className="text-xs text-gray-500">
                          {event.community?.name || 'Community Event'}
                        </p>
                      </div>
                    </div>
                    <div className="flex mt-2 text-sm">
                      <div className="flex items-center mr-4 text-gray-600">
                        <FaClock className="mr-1 h-3 w-3" />
                        {format(new Date(event.startTime), 'MMM d, h:mm a')}
                      </div>
                      {event.location && (
                        <div className="flex items-center text-gray-600">
                          <FaMapMarkerAlt className="mr-1 h-3 w-3" />
                          {event.location.length > 20 ? event.location.substring(0, 18) + '...' : event.location}
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                        {event.type}
                      </span>
                      {event.attendeeCount > 0 && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <FaUserFriends className="mr-1 h-2 w-2" /> {event.attendeeCount} attending
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4">
                <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No upcoming events</h3>
                <p className="text-gray-500 mt-2">Discover events from communities that match your interests.</p>
                <Link 
                  href="/dashboard/discover" 
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700"
                >
                  Find Events
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Active Conversations */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center">
                <FaComments className="mr-2" /> Active Chats
              </h2>
              <Link href="/dashboard/messages" className="text-xs text-white flex items-center hover:underline">
                View All <FaChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </div>
          
          <div className="p-4">
            {dataLoading.messages ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : activeConversations.length > 0 ? (
              <div className="space-y-2">
                {activeConversations.map((conversation, index) => (
                  <Link 
                    href={`/dashboard/messages/${conversation.id}`}
                    key={index}
                    className="flex items-center p-2 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                      {conversation.otherUser?.profilePicture ? (
                        <img 
                          src={conversation.otherUser.profilePicture} 
                          alt={conversation.otherUser.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-bold text-lg">
                          {conversation.otherUser?.name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{conversation.otherUser?.name || 'User'}</h3>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage?.content || 'Start a conversation...'}
                      </p>
                    </div>
                    {conversation.unreadCount && conversation.unreadCount > 0 && (
                      <div className="ml-2 bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 px-2">
                <p className="text-gray-500 text-sm">No active conversations</p>
                <Link 
                  href="/dashboard/matches" 
                  className="mt-2 inline-flex items-center px-3 py-1 border border-transparent rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Start Chatting
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Suggested Communities */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
          <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center">
                <FaUsers className="mr-2" /> For You
              </h2>
              <Link href="/dashboard/communities" className="text-xs text-white flex items-center hover:underline">
                Explore <FaChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </div>
          
          <div className="p-4">
            {dataLoading.communities ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : suggestedCommunities.length > 0 ? (
              <div className="space-y-2">
                {suggestedCommunities.map((community, index) => (
                  <Link 
                    href={`/dashboard/communities/${community.id}`}
                    key={index}
                    className="flex items-center p-2 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-gray-200 overflow-hidden mr-3">
                      {community.imageUrl ? (
                        <img 
                          src={community.imageUrl} 
                          alt={community.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-green-400 to-emerald-400 text-white font-bold text-lg">
                          {community.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{community.name}</h3>
                      <div className="flex items-center text-xs text-gray-500">
                        <FaUsers className="mr-1 h-2 w-2" />
                        <span>{community.memberCount} members</span>
                      </div>
                    </div>
                    {community.category && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {community.category}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 px-2">
                <p className="text-gray-500 text-sm">No community suggestions</p>
                <Link 
                  href="/dashboard/communities" 
                  className="mt-2 inline-flex items-center px-3 py-1 border border-transparent rounded-md text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Find Communities
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Activity Feed */}
      <div className="mt-6 bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center">
              <FaBell className="mr-2" /> Recent Activity
            </h2>
          </div>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <FaHeart className="h-4 w-4 text-indigo-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-900">You matched with <span className="font-medium">Jordan T.</span></p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <FaUsers className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-900">You joined <span className="font-medium">Photography Enthusiasts</span> community</p>
                <p className="text-xs text-gray-500">Yesterday</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <FaCalendarAlt className="h-4 w-4 text-amber-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-900">New event: <span className="font-medium">Weekend Hiking Trip</span></p>
                <p className="text-xs text-gray-500">3 days ago</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaComments className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-900"><span className="font-medium">Alex M.</span> sent you a message</p>
                <p className="text-xs text-gray-500">5 days ago</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              View All Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
