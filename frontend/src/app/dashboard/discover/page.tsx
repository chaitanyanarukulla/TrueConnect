"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { 
  FaCalendarAlt, FaFilter, FaClock, FaMapMarkerAlt, FaUserFriends, 
  FaTag, FaSearch, FaFire, FaSort, FaCompass, FaUsers, 
  FaArrowUp, FaThumbsUp, FaMedal, FaStar, FaHeart
} from "react-icons/fa";
import { format } from "date-fns";
import eventService, { Event, EventDiscoveryOptions, PaginatedResponse } from "@/services/api/event";
import { EventType, EventStatus } from "@/modules/communities/dto/create-event.dto";
import { CommunityCategory } from "@/types/enums";
import CommunityAvatar from "@/components/ui/CommunityAvatar";
import EventCard from "@/components/ui/EventCard";

export default function DiscoverPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 9, pages: 0 });
  const [filters, setFilters] = useState<EventDiscoveryOptions>({
    upcoming: true,
    page: 1,
    limit: 9,
    status: EventStatus.PUBLISHED,
    sort: 'date',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationDistance, setLocationDistance] = useState(10); // Default 10km
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showTrending, setShowTrending] = useState(true);
  const [trendingEvents, setTrendingEvents] = useState<Event[]>([]);
  const trendingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEvents();
    
    // Only fetch trending events on initial load
    if (showTrending) {
      fetchTrendingEvents();
    }
  }, [filters, userLocation]);

  // Get user's location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    
    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationEnabled(true);
        setIsGettingLocation(false);
        setLocationError(null);
      },
      (error) => {
        setLocationError("Unable to retrieve your location");
        setIsGettingLocation(false);
        console.error("Geolocation error:", error);
      }
    );
  };

  // Fetch trending events (most popular events)
  const fetchTrendingEvents = async () => {
    try {
      const result = await eventService.discoverEvents({
        upcoming: true,
        limit: 4,
        sort: 'popularity',
        status: EventStatus.PUBLISHED,
      });
      
      setTrendingEvents(result.data);
    } catch (err) {
      console.error('Error fetching trending events:', err);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare filter options including searchTerm as a search query
      const filterOptions: EventDiscoveryOptions = {
        ...filters,
      };
      
      // Add search term if available
      if (searchTerm.trim()) {
        filterOptions.search = searchTerm.trim();
      }
      
      // Add location if enabled
      if (locationEnabled && userLocation) {
        filterOptions.location = {
          lat: userLocation.lat,
          lng: userLocation.lng,
          distance: locationDistance
        };
      }
      
      const result = await eventService.discoverEvents(filterOptions);
      setEvents(result.data);
      setMeta(result.meta);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFilters(prev => ({ ...prev, [name]: checkbox.checked }));
    } else if (type === 'range') {
      const range = e.target as HTMLInputElement;
      setLocationDistance(parseInt(range.value));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleLocationToggle = () => {
    if (!locationEnabled) {
      getUserLocation();
    } else {
      setLocationEnabled(false);
      setUserLocation(null);
    }
  };

  const scrollToTrending = () => {
    if (trendingRef.current) {
      trendingRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset page to 1 when searching
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchEvents();
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case EventType.ONLINE:
        return <span className="text-blue-500 bg-blue-100 px-2 py-1 rounded-full text-xs font-medium">Online</span>;
      case EventType.IN_PERSON:
        return <span className="text-green-500 bg-green-100 px-2 py-1 rounded-full text-xs font-medium">In Person</span>;
      case EventType.HYBRID:
        return <span className="text-purple-500 bg-purple-100 px-2 py-1 rounded-full text-xs font-medium">Hybrid</span>;
      default:
        return null;
    }
  };
  
  const getCommunityBadge = (event: Event) => {
    if (!event.community) return null;
    
    let badgeColor = "bg-blue-50 text-blue-600";
    
    // Adjust color based on category if available
    if (event.community.category) {
      switch (event.community.category) {
        case CommunityCategory.SPORTS:
          badgeColor = "bg-green-50 text-green-600";
          break;
        case CommunityCategory.ARTS:
          badgeColor = "bg-purple-50 text-purple-600";
          break;
        case CommunityCategory.TECHNOLOGY:
          badgeColor = "bg-blue-50 text-blue-600";
          break;
        case CommunityCategory.FOOD:
          badgeColor = "bg-orange-50 text-orange-600";
          break;
        case CommunityCategory.TRAVEL:
          badgeColor = "bg-teal-50 text-teal-600";
          break;
        case CommunityCategory.EDUCATION:
          badgeColor = "bg-indigo-50 text-indigo-600";
          break;
        case CommunityCategory.MUSIC:
          badgeColor = "bg-pink-50 text-pink-600";
          break;
        default:
          badgeColor = "bg-blue-50 text-blue-600";
      }
    }
    
    return (
      <span className={`text-xs font-medium ${badgeColor} px-2 py-1 rounded-full`}>
        {event.community.name}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Discover</h1>
          <p className="text-gray-500 mt-1">Find events and people that match your interests</p>
        </div>
        
        {/* Discovery Type Tabs */}
        <div className="flex flex-col gap-4 mt-4 sm:mt-0">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <Link 
              href="/dashboard/discover" 
              className="flex-1 px-4 py-2 text-center text-sm font-medium bg-primary text-white"
            >
              Events
            </Link>
            <Link 
              href="/dashboard/discover/profiles" 
              className="flex-1 px-4 py-2 text-center text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              People
            </Link>
          </div>
          
          <div className="flex gap-2">
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <FaFilter className="mr-2 -ml-1 h-4 w-4" />
              Filters
            </button>
            
            {showTrending && (
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={scrollToTrending}
              >
                <FaFire className="mr-2 -ml-1 h-4 w-4" />
                Trending
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Trending Events Section */}
      {showTrending && trendingEvents.length > 0 && (
        <div ref={trendingRef} className="mb-8">
          <div className="flex items-center mb-4">
            <FaFire className="text-red-500 mr-2" />
            <h2 className="text-xl font-bold">Trending Events</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trendingEvents.map((event) => (
              <EventCard 
                key={`trending-${event.id}`}
                event={event}
                className="h-full"
              />
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className={`bg-white shadow-md rounded-lg p-4 mb-6 transition-all duration-300 ${filterOpen ? 'block' : 'hidden'}`}>
        <form onSubmit={handleSearchSubmit} className="mb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search events by keyword or tag"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Search
            </button>
          </div>
        </form>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
            <select
              name="type"
              value={filters.type || ''}
              onChange={handleFilterChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All types</option>
              <option value={EventType.IN_PERSON}>In-Person</option>
              <option value={EventType.ONLINE}>Online</option>
              <option value={EventType.HYBRID}>Hybrid</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={filters.category || ''}
              onChange={handleFilterChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All categories</option>
              <option value={CommunityCategory.SPORTS}>Sports</option>
              <option value={CommunityCategory.ARTS}>Arts</option>
              <option value={CommunityCategory.TECHNOLOGY}>Technology</option>
              <option value={CommunityCategory.FOOD}>Food</option>
              <option value={CommunityCategory.TRAVEL}>Travel</option>
              <option value={CommunityCategory.EDUCATION}>Education</option>
              <option value={CommunityCategory.MUSIC}>Music</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              name="sort"
              value={filters.sort || 'date'}
              onChange={handleFilterChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="date">Date (Soonest)</option>
              <option value="popularity">Popularity</option>
              <option value="relevance">Relevance</option>
              {locationEnabled && <option value="distance">Distance</option>}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="upcoming"
              name="upcoming"
              checked={!!filters.upcoming}
              onChange={handleFilterChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="upcoming" className="ml-2 block text-sm text-gray-700">
              Upcoming events only
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="myCommunitiesOnly"
              name="myCommunitiesOnly"
              checked={!!filters.myCommunitiesOnly}
              onChange={handleFilterChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="myCommunitiesOnly" className="ml-2 block text-sm text-gray-700">
              From my communities only
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAttending"
              name="isAttending"
              checked={!!filters.isAttending}
              onChange={handleFilterChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isAttending" className="ml-2 block text-sm text-gray-700">
              Events I'm attending
            </label>
          </div>
        </div>
        
        {/* Location-based search */}
        <div className="mt-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaMapMarkerAlt className="text-red-500 mr-2" />
              <h3 className="font-medium">Location-based search</h3>
            </div>
            <button
              type="button"
              onClick={handleLocationToggle}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                locationEnabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {isGettingLocation 
                ? 'Getting location...' 
                : locationEnabled 
                  ? 'Enabled' 
                  : 'Enable'}
            </button>
          </div>
          
          {locationError && (
            <p className="mt-1 text-sm text-red-600">{locationError}</p>
          )}
          
          {locationEnabled && userLocation && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="distance" className="text-sm text-gray-700">
                  Distance: {locationDistance} km
                </label>
              </div>
              <input
                type="range"
                id="distance"
                name="distance"
                min="1"
                max="100"
                value={locationDistance}
                onChange={handleFilterChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 km</span>
                <span>50 km</span>
                <span>100 km</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              setFilters({
                upcoming: true,
                page: 1,
                limit: 9,
                status: EventStatus.PUBLISHED,
                sort: 'date',
              });
              setSearchTerm('');
              setLocationEnabled(false);
              setUserLocation(null);
            }}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Reset all filters
          </button>
        </div>
      </div>
      
      {/* Filter Summary - only show if filters are active */}
      {(searchTerm || 
        filters.type || 
        filters.category || 
        filters.myCommunitiesOnly || 
        filters.isAttending || 
        locationEnabled) && (
        <div className="bg-blue-50 p-3 rounded-lg mb-6 flex flex-wrap items-center gap-2">
          <span className="text-blue-700 font-medium">Active filters:</span>
          
          {searchTerm && (
            <span className="bg-white text-blue-600 px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <FaSearch className="mr-1" /> {searchTerm}
            </span>
          )}

          {filters.type && (
            <span className="bg-white text-blue-600 px-2 py-1 rounded-full text-xs font-medium flex items-center">
              {filters.type === EventType.ONLINE ? <FaCompass className="mr-1" /> : 
               filters.type === EventType.IN_PERSON ? <FaMapMarkerAlt className="mr-1" /> : 
               <FaUsers className="mr-1" />} 
              {filters.type}
            </span>
          )}

          {filters.category && (
            <span className="bg-white text-blue-600 px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <FaTag className="mr-1" /> {filters.category}
            </span>
          )}

          {filters.myCommunitiesOnly && (
            <span className="bg-white text-blue-600 px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <FaUsers className="mr-1" /> My communities
            </span>
          )}

          {filters.isAttending && (
            <span className="bg-white text-blue-600 px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <FaCalendarAlt className="mr-1" /> Attending
            </span>
          )}
          
          {locationEnabled && (
            <span className="bg-white text-blue-600 px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <FaMapMarkerAlt className="mr-1" /> Within {locationDistance}km
            </span>
          )}
        </div>
      )}
      
      {/* Events Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No events found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filters or check back later for new events.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard 
                key={event.id}
                event={event}
                className="h-full"
              />
            ))}
          </div>
          
          {/* Pagination */}
          {meta.pages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center">
                <button
                  onClick={() => handlePageChange(Math.max(1, meta.page - 1))}
                  disabled={meta.page === 1}
                  className="mr-2 inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex">
                  {Array.from({ length: meta.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`mx-1 inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${
                        page === meta.page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => handlePageChange(Math.min(meta.pages, meta.page + 1))}
                  disabled={meta.page === meta.pages}
                  className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}
