import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaMapMarkerAlt, 
  FaLink, 
  FaUsers, 
  FaCheckCircle, 
  FaQuestionCircle, 
  FaTimesCircle,
  FaEdit,
  FaTrash,
  FaUserCircle
} from 'react-icons/fa';
import eventService, { Event, EventAttendee } from '../../../services/api/event';
import { EventStatus, EventType } from '../../../modules/communities/dto/create-event.dto';
import { format } from 'date-fns';
import { useAuth } from '../../../context/AuthContext';

interface EventDetailProps {
  communityId: string;
  eventId: string;
}

const EventDetail: React.FC<EventDetailProps> = ({ communityId, eventId }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [userRsvp, setUserRsvp] = useState<EventAttendee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);

  const fetchEventData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch event details
      const eventData = await eventService.getEvent(communityId, eventId);
      setEvent(eventData);
      
      // Check if user is the creator
      setIsCreator(user?.id === eventData.creatorId);
      
      // Fetch attendees
      const attendeesData = await eventService.getAttendees(communityId, eventId);
      setAttendees(attendeesData);
      
      // Fetch user's RSVP status
      if (user) {
        const rsvpData = await eventService.getUserRsvp(communityId, eventId);
        setUserRsvp(rsvpData);
      }
    } catch (err) {
      console.error('Failed to fetch event data:', err);
      setError('Failed to load event details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [communityId, eventId, user]);

  const handleRSVP = async (status: 'going' | 'maybe' | 'not_going') => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    try {
      setRsvpLoading(true);
      await eventService.rsvp(communityId, eventId, status);
      await fetchEventData(); // Refresh data
    } catch (err) {
      console.error('Failed to RSVP:', err);
      setError('Failed to submit your RSVP. Please try again.');
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleCancelRSVP = async () => {
    if (!user) return;
    
    try {
      setRsvpLoading(true);
      await eventService.cancelRsvp(communityId, eventId);
      await fetchEventData(); // Refresh data
    } catch (err) {
      console.error('Failed to cancel RSVP:', err);
      setError('Failed to cancel your RSVP. Please try again.');
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleEditEvent = () => {
    router.push(`/dashboard/communities/${communityId}/events/${eventId}/edit`);
  };

  const handlePublishEvent = async () => {
    if (!isCreator) return;
    
    try {
      await eventService.publishEvent(communityId, eventId);
      await fetchEventData(); // Refresh data
    } catch (err) {
      console.error('Failed to publish event:', err);
      setError('Failed to publish the event. Please try again.');
    }
  };

  const handleCancelEvent = async () => {
    if (!isCreator) return;
    
    try {
      await eventService.cancelEvent(communityId, eventId);
      await fetchEventData(); // Refresh data
    } catch (err) {
      console.error('Failed to cancel event:', err);
      setError('Failed to cancel the event. Please try again.');
    }
  };

  const handleDeleteEvent = async () => {
    if (!isCreator) return;
    
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await eventService.deleteEvent(communityId, eventId);
        router.push(`/dashboard/communities/${communityId}/events`);
      } catch (err) {
        console.error('Failed to delete event:', err);
        setError('Failed to delete the event. Please try again.');
      }
    }
  };

  const getEventStatusClass = (status: EventStatus) => {
    switch (status) {
      case EventStatus.DRAFT:
        return 'bg-gray-100 text-gray-700';
      case EventStatus.PUBLISHED:
        return 'bg-green-100 text-green-700';
      case EventStatus.CANCELLED:
        return 'bg-red-100 text-red-700';
      case EventStatus.COMPLETED:
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getEventTypeClass = (type: EventType) => {
    switch (type) {
      case EventType.ONLINE:
        return 'bg-blue-100 text-blue-700';
      case EventType.IN_PERSON:
        return 'bg-green-100 text-green-700';
      case EventType.HYBRID:
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="mt-2 text-lg font-medium text-gray-900">Event not found</h3>
        <p className="mt-1 text-sm text-gray-500">The event you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Event Header */}
      <div className="relative">
        {event.imageUrl ? (
          <div className="h-64 rounded-lg overflow-hidden">
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-64 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
            <div className="text-white text-center px-4">
              <FaCalendarAlt className="mx-auto h-12 w-12 mb-4" />
              <h1 className="text-2xl font-bold">{event.title}</h1>
            </div>
          </div>
        )}
        
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEventStatusClass(event.status)}`}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeClass(event.type)}`}>
            {event.type === EventType.IN_PERSON 
              ? 'In Person' 
              : event.type.charAt(0).toUpperCase() + event.type.slice(1)}
          </span>
        </div>
      </div>
      
      {/* Event Actions */}
      {isCreator && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleEditEvent}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaEdit className="mr-2 -ml-1 h-4 w-4" />
            Edit Event
          </button>
          
          {event.status === EventStatus.DRAFT && (
            <button
              onClick={handlePublishEvent}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FaCheckCircle className="mr-2 -ml-1 h-4 w-4" />
              Publish Event
            </button>
          )}
          
          {event.status === EventStatus.PUBLISHED && (
            <button
              onClick={handleCancelEvent}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <FaTimesCircle className="mr-2 -ml-1 h-4 w-4" />
              Cancel Event
            </button>
          )}
          
          <button
            onClick={handleDeleteEvent}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <FaTrash className="mr-2 -ml-1 h-4 w-4" />
            Delete Event
          </button>
        </div>
      )}
      
      {/* Event Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            <p className="mt-2 text-sm text-gray-500">
              Hosted by {event.creator?.name || 'Unknown'}
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <FaClock className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Date and Time</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(event.startTime), 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-sm text-gray-500">
                  {format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
                </p>
              </div>
            </div>
            
            {(event.type === EventType.IN_PERSON || event.type === EventType.HYBRID) && event.location && (
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-500">{event.location}</p>
                </div>
              </div>
            )}
            
            {(event.type === EventType.ONLINE || event.type === EventType.HYBRID) && event.virtualMeetingUrl && (
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FaLink className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Virtual Meeting</p>
                  <a 
                    href={event.virtualMeetingUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {event.virtualMeetingUrl}
                  </a>
                </div>
              </div>
            )}
            
            {event.attendeeLimit > 0 && (
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FaUsers className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Attendees</p>
                  <p className="text-sm text-gray-500">
                    {event.attendeeCount}/{event.attendeeLimit} spots filled
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-lg font-medium text-gray-900">About this event</h2>
            <div className="mt-2 prose prose-blue max-w-none">
              <p className="whitespace-pre-line">{event.description}</p>
            </div>
          </div>
          
          {event.tags && event.tags.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-900">Tags</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {event.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          {/* RSVP Section */}
          {event.status === EventStatus.PUBLISHED && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">RSVP to this event</h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                {!user ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-4">You need to be logged in to RSVP.</p>
                    <button
                      onClick={() => router.push('/auth/login')}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Log In to RSVP
                    </button>
                  </div>
                ) : userRsvp ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center text-center">
                      <div>
                        <div className="flex justify-center">
                          {userRsvp.status === 'going' && <FaCheckCircle className="h-8 w-8 text-green-500" />}
                          {userRsvp.status === 'interested' && <FaQuestionCircle className="h-8 w-8 text-yellow-500" />}
                          {userRsvp.status === 'not_going' && <FaTimesCircle className="h-8 w-8 text-red-500" />}
                        </div>
                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {userRsvp.status === 'going' && "You're going!"}
                          {userRsvp.status === 'interested' && "You're interested"}
                          {userRsvp.status === 'not_going' && "You're not going"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleRSVP('going')}
                        disabled={rsvpLoading || userRsvp.status === 'going'}
                        className={`inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          userRsvp.status === 'going'
                            ? 'bg-green-100 text-green-800 cursor-default'
                            : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                        }`}
                      >
                        <FaCheckCircle className="mr-2 -ml-1 h-4 w-4" />
                        {userRsvp.status === 'going' ? "You're Going" : "Going"}
                      </button>
                      
                      <button
                        onClick={() => handleRSVP('maybe')}
                        disabled={rsvpLoading || userRsvp.status === 'interested'}
                        className={`inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          userRsvp.status === 'interested'
                            ? 'bg-yellow-100 text-yellow-800 cursor-default'
                            : 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500'
                        }`}
                      >
                        <FaQuestionCircle className="mr-2 -ml-1 h-4 w-4" />
                        {userRsvp.status === 'interested' ? "You're Interested" : "Interested"}
                      </button>
                      
                      <button
                        onClick={() => handleRSVP('not_going')}
                        disabled={rsvpLoading || userRsvp.status === 'not_going'}
                        className={`inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          userRsvp.status === 'not_going'
                            ? 'bg-red-100 text-red-800 cursor-default'
                            : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                        }`}
                      >
                        <FaTimesCircle className="mr-2 -ml-1 h-4 w-4" />
                        {userRsvp.status === 'not_going' ? "You're Not Going" : "Not Going"}
                      </button>
                      
                      <button
                        onClick={handleCancelRSVP}
                        disabled={rsvpLoading}
                        className="mt-2 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel RSVP
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => handleRSVP('going')}
                      disabled={rsvpLoading}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <FaCheckCircle className="mr-2 -ml-1 h-4 w-4" />
                      Going
                    </button>
                    
                    <button
                      onClick={() => handleRSVP('maybe')}
                      disabled={rsvpLoading}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      <FaQuestionCircle className="mr-2 -ml-1 h-4 w-4" />
                      Interested
                    </button>
                    
                    <button
                      onClick={() => handleRSVP('not_going')}
                      disabled={rsvpLoading}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <FaTimesCircle className="mr-2 -ml-1 h-4 w-4" />
                      Not Going
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Attendees Section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Attendees</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">{attendees.length} people going</p>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
                {attendees.length === 0 ? (
                  <li className="px-4 py-4 sm:px-6">
                    <p className="text-sm text-gray-500">No attendees yet</p>
                  </li>
                ) : (
                  attendees.map((attendee) => (
                    <li key={attendee.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {attendee.user?.profilePicture ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={attendee.user.profilePicture}
                              alt={attendee.user.name}
                            />
                          ) : (
                            <FaUserCircle className="h-10 w-10 text-gray-400" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{attendee.user?.name || 'Unknown'}</p>
                          {attendee.isOrganizer && (
                            <p className="text-xs text-gray-500">Organizer</p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
