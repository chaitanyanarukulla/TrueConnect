"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { profileService } from "@/services/api/profile";
import { ProfilePhotoSection } from "@/features/profiles/components/ProfilePhotoSection";
import { ProfileForm } from "@/features/profiles/components/ProfileForm";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [relationshipType, setRelationshipType] = useState('');
  const [occupation, setOccupation] = useState('');
  const [education, setEducation] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  
  // Lifestyle attributes
  const [smoking, setSmoking] = useState('');
  const [drinking, setDrinking] = useState('');
  const [diet, setDiet] = useState('');
  const [exercise, setExercise] = useState('');
  
  // Religion & Culture
  const [religion, setReligion] = useState('');
  const [religiousImportance, setReligiousImportance] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState('');
  
  // Future plans
  const [wantChildren, setWantChildren] = useState('');
  
  // Pet preferences
  const [petPreferences, setPetPreferences] = useState<string[]>([]);
  
  // Relationship style
  const [communicationStyle, setCommunicationStyle] = useState('');
  const [loveLanguages, setLoveLanguages] = useState<string[]>([]);
  
  // Personality & values
  const [personality, setPersonality] = useState<string[]>([]);
  const [values, setValues] = useState<string[]>([]);
  
  // Matching preferences
  const [ageRangeMin, setAgeRangeMin] = useState(18);
  const [ageRangeMax, setAgeRangeMax] = useState(99);
  const [distance, setDistance] = useState(50);
  const [genderPreferences, setGenderPreferences] = useState<string[]>([]);
  
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
        setRelationshipType(profileData.relationshipType || '');
        setOccupation(profileData.occupation || '');
        setEducation(profileData.education || '');
        setInterests(profileData.interests || []);
        
        // Lifestyle attributes
        setSmoking(profileData.lifestyle?.smoking || '');
        setDrinking(profileData.lifestyle?.drinking || '');
        setDiet(profileData.lifestyle?.diet || '');
        setExercise(profileData.lifestyle?.exercise || '');
        
        // Personality & values
        setPersonality(profileData.personality || []);
        setValues(profileData.values || []);
        
        // Matching preferences
        setAgeRangeMin(profileData.preferences?.ageRange?.min || 18);
        setAgeRangeMax(profileData.preferences?.ageRange?.max || 99);
        setDistance(profileData.preferences?.distance || 50);
        setGenderPreferences(profileData.preferences?.genderPreferences || []);
        
        // New attributes
        setReligion(profileData.religion || '');
        setReligiousImportance(profileData.religiousImportance || '');
        setLanguages(profileData.languages || []);
        setWantChildren(profileData.wantChildren || '');
        setPetPreferences(profileData.petPreferences || []);
        setCommunicationStyle(profileData.communicationStyle || '');
        setLoveLanguages(profileData.loveLanguages || []);
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
        relationshipType,
        occupation,
        education,
        interests,
        lifestyle: {
          smoking,
          drinking,
          diet,
          exercise
        },
        personality,
        values,
        preferences: {
          ageRange: { min: ageRangeMin, max: ageRangeMax },
          distance,
          genderPreferences
        },
        // New attributes
        religion,
        religiousImportance,
        languages,
        wantChildren,
        petPreferences,
        communicationStyle,
        loveLanguages
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
  
  const handleAddLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
      setLanguages([...languages, newLanguage.trim()]);
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (language: string) => {
    setLanguages(languages.filter(l => l !== language));
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
        <ProfilePhotoSection 
          profile={profile}
          isSubmitting={isSubmitting}
          onPhotoUpload={handlePhotoUpload}
        />
        
        {/* Profile form section */}
        <div className="w-full md:w-2/3">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <ProfileForm
              // Basic info
              bio={bio}
              location={location}
              lookingFor={lookingFor}
              relationshipType={relationshipType}
              occupation={occupation}
              education={education}
              
              // Lifestyle
              smoking={smoking}
              drinking={drinking}
              diet={diet}
              exercise={exercise}
              
              // Religion & Culture
              religion={religion}
              religiousImportance={religiousImportance}
              languages={languages}
              newLanguage={newLanguage}
              
              // Future plans
              wantChildren={wantChildren}
              
              // Pet preferences
              petPreferences={petPreferences}
              
              // Relationship style
              communicationStyle={communicationStyle}
              loveLanguages={loveLanguages}
              
              // Personality & values
              personality={personality}
              values={values}
              
              // Interests
              interests={interests}
              newInterest={newInterest}
              
              // Form state
              isSubmitting={isSubmitting}
              
              // Setters
              setBio={setBio}
              setLocation={setLocation}
              setLookingFor={setLookingFor}
              setRelationshipType={setRelationshipType}
              setOccupation={setOccupation}
              setEducation={setEducation}
              setSmoking={setSmoking}
              setDrinking={setDrinking}
              setDiet={setDiet}
              setExercise={setExercise}
              setReligion={setReligion}
              setReligiousImportance={setReligiousImportance}
              setNewLanguage={setNewLanguage}
              setWantChildren={setWantChildren}
              setPetPreferences={setPetPreferences}
              setCommunicationStyle={setCommunicationStyle}
              setLoveLanguages={setLoveLanguages}
              setPersonality={setPersonality}
              setValues={setValues}
              setNewInterest={setNewInterest}
              
              // Handlers
              handleAddLanguage={handleAddLanguage}
              handleRemoveLanguage={handleRemoveLanguage}
              handleAddInterest={handleAddInterest}
              handleRemoveInterest={handleRemoveInterest}
              handleSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
