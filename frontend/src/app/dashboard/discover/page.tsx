"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { FaCalendarAlt, FaFilter, FaClock, FaMapMarkerAlt, FaUserFriends, FaTag, FaSearch } from "react-icons/fa";
import { format } from "date-fns";
import eventService, { Event, EventDiscoveryOptions, PaginatedResponse } from "@/services/api/event";
import { EventType, EventStatus } from "@/modules/communities/dto/create-event.dto";

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
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare filter options including searchTerm as a tag if available
      const filterOptions: EventDiscoveryOptions = {
        ...filters,
      };
      
      // If we have a search term, treat it as a tag filter
      if (searchTerm.trim()) {
        filterOptions.tags = searchTerm.trim();
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

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFilters(prev => ({ ...prev, [name]: checkbox.checked }));
    } else if (type === 'select-one') {
      setFilters(prev => ({ ...prev, [name]: value }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
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

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-3xl font-bold text-primary">Discover Events</h1>
        
        <button
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => setFilterOpen(!filterOpen)}
        >
          <FaFilter className="mr-2 -ml-1 h-4 w-4" />
          Filters
        </button>
      </div>
      
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Results per page</label>
            <select
              name="limit"
              value={filters.limit || 9}
              onChange={handleFilterChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value={9}>9</option>
              <option value={18}>18</option>
              <option value={27}>27</option>
            </select>
          </div>
          
          <div>
            <button
              onClick={() => {
                setFilters({
                  upcoming: true,
                  page: 1,
                  limit: 9,
                  status: EventStatus.PUBLISHED,
                });
                setSearchTerm('');
              }}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset filters
            </button>
          </div>
        </div>
      </div>
      
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
              <div
                key={event.id}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
              >
                <a 
                  href={`/dashboard/communities/${event.communityId}/events/${event.id}`}
                  className="block"
                >
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white">
                        <h3 className="text-xl font-bold text-center px-4">{event.title}</h3>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex flex-col gap-2">
                      {getEventTypeIcon(event.type)}
                    </div>
                  </div>
                  
                  <div className="px-4 py-4">
                    <div className="flex items-center mb-1">
                      {/* Display community info */}
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        From Community
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h3>
                    
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaClock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <span>
                          {format(new Date(event.startTime), 'MMM d, yyyy • h:mm a')}
                        </span>
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center text-sm text-gray-500">
                          <FaMapMarkerAlt className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      
                      {event.attendeeLimit > 0 && (
                        <div className="flex items-center text-sm text-gray-500">
                          <FaUserFriends className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <span>
                            {event.attendeeCount}/{event.attendeeLimit} attendees
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      {event.tags?.map((tag, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          <FaTag className="h-2 w-2 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </a>
              </div>
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
