"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

export function ProfileForm({ user }: { user: { name?: string | null } }) {
  const [name, setName] = useState(user.name ?? "");
  const router = useRouter();

  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({ name });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-slate-700"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          required
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={updateProfile.isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {updateProfile.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {updateProfile.isSuccess && (
        <p className="text-sm text-green-600">Profile updated successfully!</p>
      )}
      {updateProfile.isError && (
        <p className="text-sm text-red-600">
          Error: {updateProfile.error.message}
        </p>
      )}
    </form>
  );
}
