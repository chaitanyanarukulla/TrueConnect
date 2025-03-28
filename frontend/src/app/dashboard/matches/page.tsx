"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { matchService, MatchData } from "@/services/api/match";
import Link from "next/link";
import ProfileImage from "@/components/ui/ProfileImage";

export default function MatchesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const userMatches = await matchService.getUserMatches();
        setMatches(userMatches);
      } catch (error) {
        console.error('Error fetching matches:', error);
        setError('Failed to load matches. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Loading your matches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-6">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="btn-primary px-6 py-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6 text-primary">Your Matches</h1>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">No matches yet</h2>
          <p className="text-gray-600 mb-6">
            Start discovering profiles to find your matches!
          </p>
          <Link href="/dashboard/discover" className="btn-primary px-6 py-2">
            Discover
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-primary">Your Matches</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <div 
            key={match.matchId} 
            className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]"
          >
            <div className="h-48 bg-gray-200 relative flex items-center justify-center">
              <ProfileImage 
                src={match.user.profilePicture} 
                alt={match.user.name} 
                size="lg"
                className="shadow-md"
              />
              
              {match.isSuperLike && (
                <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Super Like
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
                <h3 className="text-white text-xl font-semibold">{match.user.name}</h3>
                {match.user.location && (
                  <p className="text-white/90 text-sm">{match.user.location}</p>
                )}
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between mb-3">
                <div className="text-sm text-gray-500">
                  Matched {new Date(match.createdAt).toLocaleDateString()}
                </div>
                <div className="text-sm text-primary font-medium">
                  {match.compatibilityScore.overall}% match
                </div>
              </div>
              
              {match.user.interests && match.user.interests.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {match.user.interests.slice(0, 3).map((interest, index) => (
                      <span key={index} className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                        {interest}
                      </span>
                    ))}
                    {match.user.interests.length > 3 && (
                      <span className="text-xs text-gray-500 px-1">
                        +{match.user.interests.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex justify-center">
                <Link 
                  href={`/dashboard/chat/${match.matchId}`}
                  className="w-full text-center btn-outline py-2"
                >
                  Start Chat
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
