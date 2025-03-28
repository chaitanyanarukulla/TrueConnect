"use client";

import React from 'react';
import { BasicInfoSection } from './BasicInfoSection';
import { LifestyleSection } from './LifestyleSection';
import { ReligionCultureSection } from './ReligionCultureSection';
import { FuturePlansSection } from './FuturePlansSection';
import { PetPreferencesSection } from './PetPreferencesSection';
import { RelationshipStyleSection } from './RelationshipStyleSection';
import { PersonalityTraitsSection } from './PersonalityTraitsSection';
import { ValuesSection } from './ValuesSection';
import { InterestsSection } from './InterestsSection';

interface ProfileFormProps {
  // Basic info
  bio: string;
  location: string;
  lookingFor: string;
  relationshipType: string;
  occupation: string;
  education: string;
  
  // Lifestyle
  smoking: string;
  drinking: string;
  diet: string;
  exercise: string;
  
  // Religion & Culture
  religion: string;
  religiousImportance: string;
  languages: string[];
  newLanguage: string;
  
  // Future plans
  wantChildren: string;
  
  // Pet preferences
  petPreferences: string[];
  
  // Relationship style
  communicationStyle: string;
  loveLanguages: string[];
  
  // Personality & values
  personality: string[];
  values: string[];
  
  // Interests
  interests: string[];
  newInterest: string;
  
  // Form state
  isSubmitting: boolean;
  
  // Setters
  setBio: (value: string) => void;
  setLocation: (value: string) => void;
  setLookingFor: (value: string) => void;
  setRelationshipType: (value: string) => void;
  setOccupation: (value: string) => void;
  setEducation: (value: string) => void;
  setSmoking: (value: string) => void;
  setDrinking: (value: string) => void;
  setDiet: (value: string) => void;
  setExercise: (value: string) => void;
  setReligion: (value: string) => void;
  setReligiousImportance: (value: string) => void;
  setNewLanguage: (value: string) => void;
  setWantChildren: (value: string) => void;
  setPetPreferences: (value: string[]) => void;
  setCommunicationStyle: (value: string) => void;
  setLoveLanguages: (value: string[]) => void;
  setPersonality: (value: string[]) => void;
  setValues: (value: string[]) => void;
  setNewInterest: (value: string) => void;
  
  // Handlers
  handleAddLanguage: () => void;
  handleRemoveLanguage: (language: string) => void;
  handleAddInterest: () => void;
  handleRemoveInterest: (interest: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  // Basic info
  bio,
  location,
  lookingFor,
  relationshipType,
  occupation,
  education,
  
  // Lifestyle
  smoking,
  drinking,
  diet,
  exercise,
  
  // Religion & Culture
  religion,
  religiousImportance,
  languages,
  newLanguage,
  
  // Future plans
  wantChildren,
  
  // Pet preferences
  petPreferences,
  
  // Relationship style
  communicationStyle,
  loveLanguages,
  
  // Personality & values
  personality,
  values,
  
  // Interests
  interests,
  newInterest,
  
  // Form state
  isSubmitting,
  
  // Setters
  setBio,
  setLocation,
  setLookingFor,
  setRelationshipType,
  setOccupation,
  setEducation,
  setSmoking,
  setDrinking,
  setDiet,
  setExercise,
  setReligion,
  setReligiousImportance,
  setNewLanguage,
  setWantChildren,
  setPetPreferences,
  setCommunicationStyle,
  setLoveLanguages,
  setPersonality,
  setValues,
  setNewInterest,
  
  // Handlers
  handleAddLanguage,
  handleRemoveLanguage,
  handleAddInterest,
  handleRemoveInterest,
  handleSubmit
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <BasicInfoSection
        bio={bio}
        location={location}
        lookingFor={lookingFor}
        relationshipType={relationshipType}
        occupation={occupation}
        education={education}
        isSubmitting={isSubmitting}
        setBio={setBio}
        setLocation={setLocation}
        setLookingFor={setLookingFor}
        setRelationshipType={setRelationshipType}
        setOccupation={setOccupation}
        setEducation={setEducation}
      />
      
      <LifestyleSection
        smoking={smoking}
        drinking={drinking}
        diet={diet}
        exercise={exercise}
        isSubmitting={isSubmitting}
        setSmoking={setSmoking}
        setDrinking={setDrinking}
        setDiet={setDiet}
        setExercise={setExercise}
      />
      
      <ReligionCultureSection
        religion={religion}
        religiousImportance={religiousImportance}
        languages={languages}
        newLanguage={newLanguage}
        isSubmitting={isSubmitting}
        setReligion={setReligion}
        setReligiousImportance={setReligiousImportance}
        setNewLanguage={setNewLanguage}
        handleAddLanguage={handleAddLanguage}
        handleRemoveLanguage={handleRemoveLanguage}
      />
      
      <FuturePlansSection
        wantChildren={wantChildren}
        isSubmitting={isSubmitting}
        setWantChildren={setWantChildren}
      />
      
      <PetPreferencesSection
        petPreferences={petPreferences}
        isSubmitting={isSubmitting}
        setPetPreferences={setPetPreferences}
      />
      
      <RelationshipStyleSection
        communicationStyle={communicationStyle}
        loveLanguages={loveLanguages}
        isSubmitting={isSubmitting}
        setCommunicationStyle={setCommunicationStyle}
        setLoveLanguages={setLoveLanguages}
      />
      
      <PersonalityTraitsSection
        personality={personality}
        isSubmitting={isSubmitting}
        setPersonality={setPersonality}
      />
      
      <ValuesSection
        values={values}
        isSubmitting={isSubmitting}
        setValues={setValues}
      />
      
      <InterestsSection
        interests={interests}
        newInterest={newInterest}
        isSubmitting={isSubmitting}
        setNewInterest={setNewInterest}
        handleAddInterest={handleAddInterest}
        handleRemoveInterest={handleRemoveInterest}
      />
      
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
  );
};
