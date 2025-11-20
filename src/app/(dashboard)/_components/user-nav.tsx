"use client";

import Link from "next/link";
import { type User } from "next-auth";

export function UserNav({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-end">
        <span className="text-sm font-medium text-slate-900">
          {user.name ?? "User"}
        </span>
        <span className="text-xs text-slate-500">{user.email}</span>
      </div>
      <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-200">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={user.name ?? "User"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-blue-100 text-blue-600">
            {user.name?.[0]?.toUpperCase() ?? "U"}
          </div>
        )}
      </div>
      <Link
        href="/settings/profile"
        className="text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        Settings
      </Link>
      <Link
        href="/api/auth/signout"
        className="text-sm font-medium text-red-600 hover:text-red-700"
      >
        Sign out
      </Link>
    </div>
  );
}
