"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import NotificationBadge from "@/features/notifications/components/NotificationBadge";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Navigation items
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'home' },
    { name: 'Discover', path: '/dashboard/discover', icon: 'search' },
    { name: 'Matches', path: '/dashboard/matches', icon: 'heart' },
    { name: 'Messages', path: '/dashboard/messages', icon: 'message' },
    { name: 'Communities', path: '/dashboard/communities', icon: 'users' },
    { name: 'Profile', path: '/dashboard/profile', icon: 'user' },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar Navigation */}
        <nav className="bg-white w-20 md:w-64 border-r hidden md:block">
          <div className="p-4 md:p-6">
            <h1 className="text-xl font-bold hidden md:block text-primary">TrueConnect</h1>
            <div className="mt-8 space-y-2">
              {navItems.map((item) => (
                <Link 
                  href={item.path} 
                  key={item.path}
                  className={`flex items-center p-3 rounded-lg ${
                    pathname === item.path || pathname?.startsWith(item.path + '/')
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="w-6 h-6 flex items-center justify-center relative">
                    {/* Simple icon placeholders - can be replaced with actual icons */}
                    {item.icon === 'home' && <span>🏠</span>}
                    {item.icon === 'search' && <span>🔍</span>}
                    {item.icon === 'heart' && <span>❤️</span>}
                    {item.icon === 'message' && (
                      <>
                        <span>💬</span>
                        <NotificationBadge className="absolute -top-2 -right-2 transform scale-75" />
                      </>
                    )}
                    {item.icon === 'users' && <span>👥</span>}
                    {item.icon === 'user' && <span>👤</span>}
                  </div>
                  <span className="ml-3 hidden md:block">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-10">
          <div className="flex justify-around">
            {navItems.map((item) => (
              <Link 
                href={item.path}
                key={item.path}
                className={`p-3 flex flex-col items-center ${
                  pathname === item.path || pathname?.startsWith(item.path + '/')
                    ? 'text-primary'
                    : 'text-gray-500'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center relative">
                  {item.icon === 'home' && <span>🏠</span>}
                  {item.icon === 'search' && <span>🔍</span>}
                  {item.icon === 'heart' && <span>❤️</span>}
                  {item.icon === 'message' && (
                    <>
                      <span>💬</span>
                      <NotificationBadge className="absolute -top-2 -right-2 transform scale-75" />
                    </>
                  )}
                  {item.icon === 'users' && <span>👥</span>}
                  {item.icon === 'user' && <span>👤</span>}
                </div>
                <span className="text-xs">{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
