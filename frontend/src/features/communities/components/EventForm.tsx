import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaLink, FaUsers, FaTags } from 'react-icons/fa';
import { CreateEventDto, EventType } from '../../../modules/communities/dto/create-event.dto';
import eventService from '../../../services/api/event';
import { format } from 'date-fns';

interface EventFormProps {
  communityId: string;
  eventId?: string;
  onSuccess?: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ communityId, eventId, onSuccess }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(!!eventId);
  
  const [formData, setFormData] = useState<CreateEventDto>({
    title: '',
    description: '',
    type: EventType.IN_PERSON,
    startTime: format(new Date(Date.now() + 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"), // Default to tomorrow
    endTime: format(new Date(Date.now() + 26 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"), // Default to 2 hours later
    location: '',
    virtualMeetingUrl: '',
    imageUrl: '',
    communityId: communityId,
    attendeeLimit: 0,
    isPrivate: false,
    tags: [],
  });
  
  const [tagsInput, setTagsInput] = useState('');
  
  useEffect(() => {
    if (eventId) {
      const fetchEvent = async () => {
        try {
          setIsLoading(true);
          const event = await eventService.getEvent(communityId, eventId);
          
          // Format dates for input fields
          const formattedStartTime = format(new Date(event.startTime), "yyyy-MM-dd'T'HH:mm");
          const formattedEndTime = format(new Date(event.endTime), "yyyy-MM-dd'T'HH:mm");
          
          setFormData({
            ...event,
            startTime: formattedStartTime,
            endTime: formattedEndTime,
            tags: event.tags || [],
          });
          
          setTagsInput(event.tags?.join(', ') || '');
        } catch (err) {
          console.error('Failed to fetch event:', err);
          setError('Failed to load event data. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchEvent();
    }
  }, [communityId, eventId]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: parseInt(value, 10) || 0,
    }));
  };
  
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsInput(e.target.value);
    
    // Update tags array from comma-separated input
    const tagsArray = e.target.value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');
    
    setFormData((prevState) => ({
      ...prevState,
      tags: tagsArray,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      
      if (isEditing && eventId) {
        await eventService.updateEvent(communityId, eventId, formData);
      } else {
        await eventService.createEvent(communityId, formData);
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/dashboard/communities/${communityId}/events`);
      }
    } catch (err) {
      console.error('Failed to save event:', err);
      setError('Failed to save event. Please check your inputs and try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading && isEditing) {
    return <div className="p-4 text-center">Loading event data...</div>;
  }
  
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Event' : 'Create New Event'}</h2>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Event Title*
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Event Description*
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Event Type*
            </label>
            <div className="relative">
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-none"
                required
              >
                <option value={EventType.IN_PERSON}>In Person</option>
                <option value={EventType.ONLINE}>Online</option>
                <option value={EventType.HYBRID}>Hybrid</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <FaCalendarAlt className="text-gray-400" />
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="isPrivate" className="block text-sm font-medium text-gray-700 mb-1">
              Privacy
            </label>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="isPrivate"
                name="isPrivate"
                checked={formData.isPrivate}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700">
                Private event (Only visible to community members)
              </label>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
              Start Time*
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <FaClock className="text-gray-400" />
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
              End Time*
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <FaClock className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        {(formData.type === EventType.IN_PERSON || formData.type === EventType.HYBRID) && (
          <div className="mb-4">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location {formData.type === EventType.IN_PERSON && '*'}
            </label>
            <div className="relative">
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required={formData.type === EventType.IN_PERSON}
              />
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <FaMapMarkerAlt className="text-gray-400" />
              </div>
            </div>
          </div>
        )}
        
        {(formData.type === EventType.ONLINE || formData.type === EventType.HYBRID) && (
          <div className="mb-4">
            <label htmlFor="virtualMeetingUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Virtual Meeting URL {formData.type === EventType.ONLINE && '*'}
            </label>
            <div className="relative">
              <input
                type="url"
                id="virtualMeetingUrl"
                name="virtualMeetingUrl"
                value={formData.virtualMeetingUrl || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required={formData.type === EventType.ONLINE}
                placeholder="https://..."
              />
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <FaLink className="text-gray-400" />
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://..."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="attendeeLimit" className="block text-sm font-medium text-gray-700 mb-1">
              Attendee Limit
            </label>
            <div className="relative">
              <input
                type="number"
                id="attendeeLimit"
                name="attendeeLimit"
                value={formData.attendeeLimit || ''}
                onChange={handleNumberChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="0 for unlimited"
              />
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <FaUsers className="text-gray-400" />
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma separated)
            </label>
            <div className="relative">
              <input
                type="text"
                id="tags"
                name="tags"
                value={tagsInput}
                onChange={handleTagsChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="outdoors, music, casual, ..."
              />
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <FaTags className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-6 space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
