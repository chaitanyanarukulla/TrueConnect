"use client";

import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-4xl font-bold text-primary mb-2">TrueConnect</h1>
        <p className="text-gray-600">Sign in to your account</p>
      </div>
      <LoginForm />
    </div>
  );
}
