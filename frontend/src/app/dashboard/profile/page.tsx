"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { profileService } from "@/services/api/profile";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [occupation, setOccupation] = useState('');
  const [education, setEducation] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await profileService.getCurrentProfile();
        setProfile(profileData);
        
        // Initialize form state with profile data
        setBio(profileData.bio || '');
        setLocation(profileData.location || '');
        setLookingFor(profileData.lookingFor || '');
        setOccupation(profileData.occupation || '');
        setEducation(profileData.education || '');
        setInterests(profileData.interests || []);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const updatedProfile = await profileService.updateProfile({
        bio,
        location,
        lookingFor,
        occupation,
        education,
        interests,
      });
      
      setProfile(updatedProfile);
      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsSubmitting(true);
      const result = await profileService.uploadProfilePhoto(file);
      
      if (result.success) {
        setProfile({
          ...profile,
          profilePicture: result.photoUrl
        });
        setSuccessMessage('Profile photo updated successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setError('Failed to upload photo. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-primary">Edit Profile</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md">
          {successMessage}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile photo section */}
        <div className="w-full md:w-1/3">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col items-center">
              <div className="w-40 h-40 rounded-full overflow-hidden mb-4 bg-gray-100 relative">
                {profile?.profilePicture ? (
                  <img 
                    src={profile.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-400">
                    No Photo
                  </div>
                )}
              </div>
              
              <div className="w-full">
                <label className="btn-outline w-full block text-center py-2 px-4 cursor-pointer">
                  Upload Photo
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={isSubmitting}
                  />
                </label>
              </div>
              
              <div className="mt-6 w-full">
                <h3 className="text-lg font-semibold mb-2">{user?.name}</h3>
                <p className="text-gray-600 text-sm mb-1">
                  {profile?.email}
                </p>
                {profile?.location && (
                  <p className="text-gray-600 text-sm">
                    {profile.location}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile form section */}
        <div className="w-full md:w-2/3">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Your city, country"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="lookingFor" className="block text-sm font-medium text-gray-700 mb-1">
                  Looking For
                </label>
                <input
                  id="lookingFor"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={lookingFor}
                  onChange={(e) => setLookingFor(e.target.value)}
                  placeholder="What are you looking for in a relationship?"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">
                  Occupation
                </label>
                <input
                  id="occupation"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="What do you do?"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                  Education
                </label>
                <input
                  id="education"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="Your education background"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interests
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {interests.map((interest, index) => (
                    <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
                      <span className="text-sm">{interest}</span>
                      <button
                        type="button"
                        className="ml-2 text-gray-500 hover:text-red-500"
                        onClick={() => handleRemoveInterest(interest)}
                        disabled={isSubmitting}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    className="flex-1 p-2 border border-gray-300 rounded-l-md"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Add an interest"
                    disabled={isSubmitting}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInterest();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="bg-primary text-white px-4 py-2 rounded-r-md"
                    onClick={handleAddInterest}
                    disabled={isSubmitting}
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full btn-primary py-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
