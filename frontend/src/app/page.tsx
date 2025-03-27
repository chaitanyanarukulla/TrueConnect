"use client";

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="w-full max-w-md mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-center text-primary">TrueConnect</h1>
          <p className="text-xl text-center text-gray-600">Find meaningful connections</p>
        </div>

        <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="relative h-64 w-full">
            <Image
              src="/landing-image.jpg"
              alt="People connecting"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Welcome to TrueConnect</h2>
            <p className="text-gray-600 mb-6">
              Join our community to find meaningful connections with like-minded people. Create your profile, match with others, and join community events!
            </p>
            <div className="flex flex-col space-y-3">
              <Link href="/auth/register" className="btn-primary text-center">
                Create Account
              </Link>
              <Link href="/auth/login" className="btn-outline text-center">
                Sign In
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-1">Meaningful Matches</h3>
            <p className="text-gray-600 text-sm">Find connections based on shared interests and compatibility</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-1">Community Events</h3>
            <p className="text-gray-600 text-sm">Join events and activities with the people you connect with</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-1">Safe & Secure</h3>
            <p className="text-gray-600 text-sm">Your safety is our top priority with profile verification and safety features</p>
          </div>
        </div>
      </div>
    </main>
  );
}
