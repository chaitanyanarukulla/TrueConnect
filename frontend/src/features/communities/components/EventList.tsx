import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaCalendarPlus, FaFilter, FaClock, FaMapMarkerAlt, FaUser, FaUsers } from 'react-icons/fa';
import eventService, { Event } from '../../../services/api/event';
import { EventStatus, EventType } from '../../../modules/communities/dto/create-event.dto';
import { format } from 'date-fns';

interface EventListProps {
  communityId: string;
}

const EventList: React.FC<EventListProps> = ({ communityId }) => {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    status: '',
    upcoming: true,
  });

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const options: { status?: EventStatus; upcoming?: boolean } = {};
      if (filter.status) {
        options.status = filter.status as EventStatus;
      }
      options.upcoming = filter.upcoming;
      
      const data = await eventService.getEvents(communityId, options);
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [communityId, filter]);

  const handleCreateEvent = () => {
    router.push(`/dashboard/communities/${communityId}/events/create`);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const handleUpcomingToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(prev => ({ ...prev, upcoming: e.target.checked }));
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

  const getEventStatusBadge = (status: EventStatus) => {
    switch (status) {
      case EventStatus.DRAFT:
        return <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">Draft</span>;
      case EventStatus.PUBLISHED:
        return <span className="text-blue-500 bg-blue-100 px-2 py-1 rounded-full text-xs font-medium">Published</span>;
      case EventStatus.CANCELLED:
        return <span className="text-red-500 bg-red-100 px-2 py-1 rounded-full text-xs font-medium">Cancelled</span>;
      case EventStatus.COMPLETED:
        return <span className="text-green-500 bg-green-100 px-2 py-1 rounded-full text-xs font-medium">Completed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold">Community Events</h2>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="upcoming" className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="upcoming"
                checked={filter.upcoming}
                onChange={handleUpcomingToggle}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Upcoming only</span>
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400" />
            <select
              name="status"
              value={filter.status}
              onChange={handleFilterChange}
              className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All statuses</option>
              <option value={EventStatus.PUBLISHED}>Published</option>
              <option value={EventStatus.DRAFT}>Draft</option>
              <option value={EventStatus.CANCELLED}>Cancelled</option>
              <option value={EventStatus.COMPLETED}>Completed</option>
            </select>
          </div>
          
          <button
            onClick={handleCreateEvent}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaCalendarPlus className="mr-2 -ml-1 h-4 w-4" />
            Create Event
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="mt-2 text-lg font-medium text-gray-900">No events found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter.upcoming
              ? "There are no upcoming events in this community."
              : "There are no events in this community."}
          </p>
          <div className="mt-6">
            <button
              onClick={handleCreateEvent}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaCalendarPlus className="mr-2 -ml-1 h-4 w-4" />
              Create the first event
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <Link href={`/dashboard/communities/${communityId}/events/${event.id}`}>
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
                    {getEventStatusBadge(event.status)}
                  </div>
                </div>
                
                <div className="px-4 py-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h3>
                    <div>{getEventTypeIcon(event.type)}</div>
                  </div>
                  
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
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <FaUser className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <span>
                        Hosted by {event.creator?.name || 'Unknown'}
                      </span>
                    </div>
                    
                    {event.attendeeLimit > 0 && (
                      <div className="flex items-center text-sm text-gray-500">
                        <FaUsers className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
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
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
