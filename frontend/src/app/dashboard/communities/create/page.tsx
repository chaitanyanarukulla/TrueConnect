"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import communityService from '@/services/api/community';
import { CommunityCategory } from '@/modules/communities/dto/create-community.dto';
import { CreateCommunityDto } from '@/modules/communities/dto/create-community.dto';
import { useAuth } from '@/context/AuthContext';
import { getAuthToken } from '@/lib/auth';

const CreateCommunityPage = () => {
  const router = useRouter();
  const { user, refreshToken } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCommunityDto>({
    name: '',
    description: '',
    category: undefined,
    isPrivate: false,
    tags: [],
  });
  const [tagInput, setTagInput] = useState<string>('');
  
  // Check authentication and refresh token if needed
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Check if token exists
        const token = getAuthToken();
        if (!token) {
          console.warn("No authentication token found");
          router.push('/auth/login');
          return;
        }
        
        // If user is not loaded, try to refresh token
        if (!user && token) {
          console.log("Token exists but no user, attempting to refresh token");
          try {
            await refreshToken();
            console.log("Token refreshed successfully");
          } catch (error) {
            console.error("Failed to refresh token:", error);
            router.push('/auth/login');
          }
        }
      } catch (error) {
        console.error("Authentication verification error:", error);
        router.push('/auth/login');
      }
    };
    
    verifyAuth();
  }, [user, router, refreshToken]);

  // Categories from the enum
  const categories = Object.entries(CommunityCategory).map(([key, value]) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ')
  }));

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Special handling for category to ensure it's properly typed
    if (name === 'category') {
      setFormData((prev: CreateCommunityDto) => ({
        ...prev,
        [name]: value === '' ? undefined : value as CommunityCategory,
      }));
    } else {
      setFormData((prev: CreateCommunityDto) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev: CreateCommunityDto) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Handle tag input
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  // Add tag when Enter key is pressed
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (formData.tags && formData.tags.length >= 10) {
        setError('Maximum 10 tags allowed');
        return;
      }
      
      const newTag = tagInput.trim().toLowerCase();
      
      // Check if tag already exists
      if (formData.tags?.includes(newTag)) {
        return;
      }
      
      setFormData((prev: CreateCommunityDto) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag],
      }));
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setFormData((prev: CreateCommunityDto) => ({
      ...prev,
      tags: prev.tags?.filter((t: string) => t !== tag) || [],
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.name || !formData.description) {
        throw new Error('Name and description are required');
      }

      // Create community
      const community = await communityService.createCommunity(formData);
      
      // Redirect to the new community page
      router.push(`/dashboard/communities/${community.id}`);
    } catch (err) {
      console.error('Failed to create community:', err);
      setError(err instanceof Error ? err.message : 'Failed to create community');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create a New Community</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
              Community Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              maxLength={100}
              required
            />
            <p className="text-gray-500 text-sm mt-1">
              {formData.name.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
              Description*
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              maxLength={255}
              required
            ></textarea>
            <p className="text-gray-500 text-sm mt-1">
              {formData.description.length}/255 characters
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="imageUrl">
              Profile Image URL
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Cover Image URL */}
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="coverImageUrl">
              Cover Image URL
            </label>
            <input
              type="url"
              id="coverImageUrl"
              name="coverImageUrl"
              value={formData.coverImageUrl || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          {/* Privacy */}
          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPrivate"
                name="isPrivate"
                checked={formData.isPrivate || false}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label className="ml-2 block text-gray-700" htmlFor="isPrivate">
                Make this community private
              </label>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Private communities require approval to join
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="tags">
              Tags (Up to 10)
            </label>
            <div className="relative">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagKeyDown}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Add a tag and press Enter"
              />
            </div>
            <div className="flex flex-wrap mt-2 gap-2">
              {formData.tags?.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-gray-500 hover:text-red-500"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Community'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunityPage;
