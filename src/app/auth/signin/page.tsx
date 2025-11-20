"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn("nodemailer", { email, callbackUrl: "/" });
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Sign <span className="text-[hsl(280,100%,70%)]">In</span>
        </h1>
        <div className="w-full max-w-md rounded-lg bg-white/10 p-8 shadow-lg backdrop-blur-md">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-white"
              >
                Email address
              </label>
              <input
                type="email"
                id="email"
                className="block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                placeholder="name@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-purple-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 focus:outline-none disabled:opacity-50 sm:w-auto"
            >
              {isLoading ? "Sending link..." : "Sign in with Email"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
