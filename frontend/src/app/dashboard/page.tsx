"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">TrueConnect</h1>
          <button 
            className="btn-outline"
            onClick={logout}
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-2xl font-bold mb-4">Welcome, {user?.name}!</h2>
            <p className="mb-4">Your TrueConnect dashboard is being prepared.</p>
            
            {/* Placeholder cards for future features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold text-lg mb-2">Find Matches</h3>
                <p className="text-gray-600">Start exploring potential matches based on your preferences.</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold text-lg mb-2">Complete Your Profile</h3>
                <p className="text-gray-600">Add more details to your profile to improve your matching.</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold text-lg mb-2">Join Communities</h3>
                <p className="text-gray-600">Find groups and events with people who share your interests.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
