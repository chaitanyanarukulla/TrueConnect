"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import profileDiscoveryService, { UserProfile, ProfileDiscoveryOptions } from '@/services/api/profile-discovery';
import ProfileCard from '@/components/ui/ProfileCard';
import { useAuth } from '@/context/AuthContext';
import { FaFilter, FaSort, FaSearch, FaHeart, FaLocationArrow } from 'react-icons/fa';

// Define lifestyle options
const LIFESTYLE_OPTIONS = {
  smoking: ['non-smoker', 'occasional', 'regular'],
  drinking: ['non-drinker', 'social', 'regular'],
  diet: ['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'other'],
  exercise: ['rarely', 'sometimes', 'regularly', 'daily']
};

// Define personality traits
const PERSONALITY_TRAITS = ["Outgoing", "Introverted", "Creative", "Analytical", "Adventurous", 
                           "Relaxed", "Organized", "Spontaneous", "Ambitious", "Laid-back"];

// Define values
const VALUES = ["Family", "Career", "Friendship", "Health", "Learning", 
                "Adventure", "Spirituality", "Creativity", "Community", "Nature"];

// Define relationship types
const RELATIONSHIP_TYPES = ["casual", "long-term", "friendship", "marriage", "unsure"];

export default function ProfileDiscoveryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  // State for profiles
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  
  // State for liked profiles
  const [likedProfiles, setLikedProfiles] = useState<Set<string>>(new Set());
  
  // State for filter drawer
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter states
  const [ageRange, setAgeRange] = useState<{min: number, max: number}>({min: 18, max: 99});
  const [distance, setDistance] = useState<number>(50);
  const [gender, setGender] = useState<string[]>([]);
  const [relationshipType, setRelationshipType] = useState<string[]>([]);
  const [lifestyle, setLifestyle] = useState<{[key: string]: string[]}>({
    smoking: [],
    drinking: [],
    diet: [],
    exercise: []
  });
  const [personality, setPersonality] = useState<string[]>([]);
  const [values, setValues] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('compatibility');
  
  // Loading more state
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Function to handle search query changes
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Function to handle sort changes
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };
  
  // Function to handle filter toggle
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };
  
  // Function to handle age range changes
  const handleAgeRangeChange = (min: number, max: number) => {
    setAgeRange({ min, max });
  };
  
  // Function to handle distance change
  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDistance(parseInt(e.target.value));
  };
  
  // Function to handle gender selection
  const handleGenderToggle = (genderValue: string) => {
    if (gender.includes(genderValue)) {
      setGender(gender.filter(g => g !== genderValue));
    } else {
      setGender([...gender, genderValue]);
    }
  };
  
  // Function to handle relationship type selection
  const handleRelationshipTypeToggle = (relationshipValue: string) => {
    if (relationshipType.includes(relationshipValue)) {
      setRelationshipType(relationshipType.filter(r => r !== relationshipValue));
    } else {
      setRelationshipType([...relationshipType, relationshipValue]);
    }
  };
  
  // Function to handle lifestyle selection
  const handleLifestyleToggle = (category: string, value: string) => {
    const currentValues = lifestyle[category] || [];
    if (currentValues.includes(value)) {
      setLifestyle({
        ...lifestyle,
        [category]: currentValues.filter(v => v !== value)
      });
    } else {
      setLifestyle({
        ...lifestyle,
        [category]: [...currentValues, value]
      });
    }
  };
  
  // Function to handle personality trait selection
  const handlePersonalityToggle = (trait: string) => {
    if (personality.includes(trait)) {
      setPersonality(personality.filter(p => p !== trait));
    } else {
      setPersonality([...personality, trait]);
    }
  };
  
  // Function to handle values selection
  const handleValueToggle = (value: string) => {
    if (values.includes(value)) {
      setValues(values.filter(v => v !== value));
    } else {
      setValues([...values, value]);
    }
  };
  
  // Function to reset all filters
  const resetFilters = () => {
    setAgeRange({min: 18, max: 99});
    setDistance(50);
    setGender([]);
    setRelationshipType([]);
    setLifestyle({
      smoking: [],
      drinking: [],
      diet: [],
      exercise: []
    });
    setPersonality([]);
    setValues([]);
    setSearchQuery('');
  };
  
  // Function to apply filters
  const applyFilters = () => {
    setPage(1);
    setLoading(true);
    setIsFilterOpen(false);
    fetchProfiles(1);
  };
  
  // Function to handle profile like
  const handleLike = async (profileId: string) => {
    try {
      const result = await profileDiscoveryService.likeProfile(profileId);
      
      if (result.success) {
        // Update the local state to show the profile as liked
        const newLikedSet = new Set(likedProfiles);
        newLikedSet.add(profileId);
        setLikedProfiles(newLikedSet);
        
        // If it's a match, we could show a notification or redirect
        if (result.match) {
          // Show match notification
          alert(`It's a match! You and this person have both liked each other.`);
        }
      }
    } catch (error) {
      console.error('Error liking profile:', error);
    }
  };
  
  // Function to handle profile unlike
  const handleUnlike = async (profileId: string) => {
    try {
      const result = await profileDiscoveryService.unlikeProfile(profileId);
      
      if (result.success) {
        // Update the local state to show the profile as unliked
        const newLikedProfiles = new Set(likedProfiles);
        newLikedProfiles.delete(profileId);
        setLikedProfiles(newLikedProfiles);
      }
    } catch (error) {
      console.error('Error unliking profile:', error);
    }
  };
  
  // Function to fetch profiles
  const fetchProfiles = async (pageNum: number) => {
    try {
      const options: ProfileDiscoveryOptions = {
        page: pageNum,
        limit: 12,
        sort: sortBy
      };
      
      // Add filters to options
      if (ageRange.min !== 18 || ageRange.max !== 99) {
        options.ageRange = ageRange;
      }
      
      if (gender.length > 0) {
        options.gender = gender;
      }
      
      if (relationshipType.length > 0) {
        options.relationshipType = relationshipType;
      }
      
      if (distance !== 50) {
        // Use geolocation or default coordinates
        // For now, use dummy coordinates for demo purposes
        options.location = {
          lat: 34.052235,  // Demo coordinates (Los Angeles)
          lng: -118.243683,
          distance: distance
        };
      }
      
      // Add lifestyle filters
      if (Object.values(lifestyle).some(arr => arr.length > 0)) {
        options.lifestyle = {};
        
        if (lifestyle.smoking?.length > 0) {
          options.lifestyle.smoking = lifestyle.smoking;
        }
        
        if (lifestyle.drinking?.length > 0) {
          options.lifestyle.drinking = lifestyle.drinking;
        }
        
        if (lifestyle.diet?.length > 0) {
          options.lifestyle.diet = lifestyle.diet;
        }
        
        if (lifestyle.exercise?.length > 0) {
          options.lifestyle.exercise = lifestyle.exercise;
        }
      }
      
      // Add personality and values filters
      if (personality.length > 0) {
        options.personality = personality;
      }
      
      if (values.length > 0) {
        options.values = values;
      }
      
      // Add search query
      if (searchQuery.trim()) {
        options.search = searchQuery.trim();
      }
      
      const result = await profileDiscoveryService.discoverProfiles(options);
      
      // Update state based on page number
      if (pageNum === 1) {
        setProfiles(result.data);
      } else {
        setProfiles(prevProfiles => [...prevProfiles, ...result.data]);
      }
      
      // Update pagination info
      setTotalResults(result.meta.total);
      setHasMore(pageNum < result.meta.pages);
      
      // Fetch liked status for these profiles
      fetchLikedProfiles(result.data.map(p => p.id));
      
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setError('Failed to load profiles. Please try again later.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  
  // Function to fetch liked profiles
  const fetchLikedProfiles = async (profileIds: string[]) => {
    // This is just a placeholder - in a real app, you'd fetch the liked status from the API
    // For now, we'll assume no profiles are liked initially
    // In a real implementation, you'd get this data from your API
    
    // Mock implementation - replace with actual API call
    try {
      // This is where you'd make an API call to check which profiles the user has liked
      // For now, we're just setting an empty set of liked profiles
      // setLikedProfiles(new Set([]));
    } catch (error) {
      console.error('Error fetching liked profiles:', error);
    }
  };
  
  // Function to load more profiles
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProfiles(nextPage);
    }
  };
  
  // Effect to fetch profiles on initial load and when filters change
  useEffect(() => {
    setLoading(true);
    fetchProfiles(1);
  }, [sortBy]); // Only re-fetch when sort changes; other filters use the apply button
  
  // Handle scroll event to implement infinite scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 200 >=
        document.documentElement.offsetHeight
      ) {
        loadMore();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Discover Profiles</h1>
        <p className="text-gray-600">Find your perfect match based on compatibility and preferences</p>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, interests, or bio"
            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={searchQuery}
            onChange={handleSearch}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                applyFilters();
              }
            }}
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="compatibility">Compatibility</option>
              <option value="distance">Distance</option>
              <option value="activity">Recent Activity</option>
              <option value="newest">Newest Profiles</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <FaSort className="text-gray-400" />
            </div>
          </div>
          
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${isFilterOpen ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            onClick={toggleFilter}
          >
            <FaFilter />
            <span className="hidden md:inline">Filters</span>
            {Object.values(lifestyle).some(arr => arr.length > 0) || 
             personality.length > 0 || 
             values.length > 0 || 
             gender.length > 0 || 
             relationshipType.length > 0 || 
             ageRange.min !== 18 || 
             ageRange.max !== 99 || 
             distance !== 50 ? (
              <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-bold text-white bg-red-500 rounded-full">
                !
              </span>
            ) : null}
          </button>
        </div>
      </div>
      
      {/* Active Filters */}
      {(gender.length > 0 || 
        relationshipType.length > 0 || 
        Object.values(lifestyle).some(arr => arr.length > 0) || 
        personality.length > 0 || 
        values.length > 0 || 
        ageRange.min !== 18 || 
        ageRange.max !== 99 || 
        distance !== 50) && !isFilterOpen && (
        <div className="flex flex-wrap gap-2 mb-6">
          {gender.length > 0 && (
            <div className="bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-full text-sm flex items-center">
              <span>Gender: {gender.join(', ')}</span>
            </div>
          )}
          
          {relationshipType.length > 0 && (
            <div className="bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-full text-sm flex items-center">
              <span>Looking for: {relationshipType.join(', ')}</span>
            </div>
          )}
          
          {ageRange.min !== 18 || ageRange.max !== 99 ? (
            <div className="bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-full text-sm flex items-center">
              <span>Age: {ageRange.min}-{ageRange.max}</span>
            </div>
          ) : null}
          
          {distance !== 50 && (
            <div className="bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-full text-sm flex items-center">
              <span>Distance: {distance} km</span>
            </div>
          )}
          
          {lifestyle.smoking.length > 0 && (
            <div className="bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-full text-sm flex items-center">
              <span>Smoking: {lifestyle.smoking.join(', ')}</span>
            </div>
          )}
          
          {lifestyle.drinking.length > 0 && (
            <div className="bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-full text-sm flex items-center">
              <span>Drinking: {lifestyle.drinking.join(', ')}</span>
            </div>
          )}
          
          {lifestyle.diet.length > 0 && (
            <div className="bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-full text-sm flex items-center">
              <span>Diet: {lifestyle.diet.join(', ')}</span>
            </div>
          )}
          
          {lifestyle.exercise.length > 0 && (
            <div className="bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-full text-sm flex items-center">
              <span>Exercise: {lifestyle.exercise.join(', ')}</span>
            </div>
          )}
          
          {personality.length > 0 && (
            <div className="bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-full text-sm flex items-center">
              <span>Personality: {personality.length} selected</span>
            </div>
          )}
          
          {values.length > 0 && (
            <div className="bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-full text-sm flex items-center">
              <span>Values: {values.length} selected</span>
            </div>
          )}
          
          <button 
            className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-3 py-1 rounded-full text-sm flex items-center"
            onClick={resetFilters}
          >
            Clear all
          </button>
        </div>
      )}
      
      {/* Filter Drawer */}
      {isFilterOpen && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Filters</h3>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={toggleFilter}
            >
              &times;
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Age Range */}
            <div>
              <h4 className="font-medium mb-2">Age Range</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="18"
                  max="99"
                  className="w-16 p-2 border border-gray-300 rounded-md"
                  value={ageRange.min}
                  onChange={(e) => handleAgeRangeChange(parseInt(e.target.value), ageRange.max)}
                />
                <span>to</span>
                <input
                  type="number"
                  min="18"
                  max="99"
                  className="w-16 p-2 border border-gray-300 rounded-md"
                  value={ageRange.max}
                  onChange={(e) => handleAgeRangeChange(ageRange.min, parseInt(e.target.value))}
                />
              </div>
            </div>
            
            {/* Distance */}
            <div>
              <h4 className="font-medium mb-2">Distance (km)</h4>
              <input
                type="range"
                min="5"
                max="500"
                step="5"
                className="w-full"
                value={distance}
                onChange={handleDistanceChange}
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>5 km</span>
                <span>{distance} km</span>
                <span>500 km</span>
              </div>
            </div>
            
            {/* Gender */}
            <div>
              <h4 className="font-medium mb-2">Gender</h4>
              <div className="flex flex-wrap gap-2">
                {["Male", "Female", "Non-binary", "Other"].map((genderOption) => (
                  <button
                    key={genderOption}
                    className={`px-3 py-1 rounded-full text-sm ${
                      gender.includes(genderOption)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handleGenderToggle(genderOption)}
                  >
                    {genderOption}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Relationship Type */}
            <div>
              <h4 className="font-medium mb-2">Looking For</h4>
              <div className="flex flex-wrap gap-2">
                {RELATIONSHIP_TYPES.map((type) => (
                  <button
                    key={type}
                    className={`px-3 py-1 rounded-full text-sm ${
                      relationshipType.includes(type)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handleRelationshipTypeToggle(type)}
                  >
                    {type === 'casual' ? 'Casual dating' : 
                     type === 'long-term' ? 'Long-term relationship' : 
                     type === 'friendship' ? 'Friendship' : 
                     type === 'marriage' ? 'Marriage-minded' : 
                     'Still figuring it out'}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Smoking */}
            <div>
              <h4 className="font-medium mb-2">Smoking</h4>
              <div className="flex flex-wrap gap-2">
                {LIFESTYLE_OPTIONS.smoking.map((option) => (
                  <button
                    key={option}
                    className={`px-3 py-1 rounded-full text-sm ${
                      lifestyle.smoking.includes(option)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handleLifestyleToggle('smoking', option)}
                  >
                    {option === 'non-smoker' ? 'Non-smoker' : 
                     option === 'occasional' ? 'Occasional' : 
                     'Regular'}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Drinking */}
            <div>
              <h4 className="font-medium mb-2">Drinking</h4>
              <div className="flex flex-wrap gap-2">
                {LIFESTYLE_OPTIONS.drinking.map((option) => (
                  <button
                    key={option}
                    className={`px-3 py-1 rounded-full text-sm ${
                      lifestyle.drinking.includes(option)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handleLifestyleToggle('drinking', option)}
                  >
                    {option === 'non-drinker' ? "Don't drink" : 
                     option === 'social' ? 'Social drinker' : 
                     'Regular drinker'}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Diet */}
            <div>
              <h4 className="font-medium mb-2">Diet</h4>
              <div className="flex flex-wrap gap-2">
                {LIFESTYLE_OPTIONS.diet.map((option) => (
                  <button
                    key={option}
                    className={`px-3 py-1 rounded-full text-sm ${
                      lifestyle.diet.includes(option)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handleLifestyleToggle('diet', option)}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Exercise */}
            <div>
              <h4 className="font-medium mb-2">Exercise</h4>
              <div className="flex flex-wrap gap-2">
                {LIFESTYLE_OPTIONS.exercise.map((option) => (
                  <button
                    key={option}
                    className={`px-3 py-1 rounded-full text-sm ${
                      lifestyle.exercise.includes(option)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handleLifestyleToggle('exercise', option)}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Personality */}
            <div className="md:col-span-2 lg:col-span-3">
              <h4 className="font-medium mb-2">Personality Traits</h4>
              <div className="flex flex-wrap gap-2">
                {PERSONALITY_TRAITS.map((trait) => (
                  <button
                    key={trait}
                    className={`px-3 py-1 rounded-full text-sm ${
                      personality.includes(trait)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handlePersonalityToggle(trait)}
                  >
                    {trait}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Values */}
            <div className="md:col-span-2 lg:col-span-3">
              <h4 className="font-medium mb-2">Values</h4>
              <div className="flex flex-wrap gap-2">
                {VALUES.map((value) => (
                  <button
                    key={value}
                    className={`px-3 py-1 rounded-full text-sm ${
                      values.includes(value)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handleValueToggle(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={resetFilters}
            >
              Reset All
            </button>
            <button
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              onClick={applyFilters}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
      
      {/* Profile Cards */}
      {loading && page === 1 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">Loading profiles...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <FaLocationArrow className="inline-block text-4xl text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No matches found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filters to see more profiles</p>
          <button
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-500 mb-4">
            {totalResults} {totalResults === 1 ? 'profile' : 'profiles'} found
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onLike={likedProfiles.has(profile.id) ? handleUnlike : handleLike}
                isLiked={likedProfiles.has(profile.id)}
                showCompatibility={true}
                showDistance={true}
              />
            ))}
          </div>
          
          {/* Loading More Indicator */}
          {loadingMore && (
            <div className="flex justify-center items-center py-6">
              <p className="text-gray-600">Loading more profiles...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
