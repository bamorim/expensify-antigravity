"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export default function CreateOrganizationPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const createOrg = api.organization.create.useMutation({
    onSuccess: (data) => {
      router.push(`/orgs/${data.id}`);
      router.refresh();
    },
    onError: (e) => {
      setError(e.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Organization name is required");
      return;
    }

    createOrg.mutate({ name });
  };

  return (
    <div className="container mx-auto max-w-md py-10">
      <h1 className="mb-8 text-3xl font-bold">Create Organization</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Organization Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Acme Corp"
            disabled={createOrg.isPending}
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={createOrg.isPending}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createOrg.isPending ? "Creating..." : "Create Organization"}
        </button>
      </form>
    </div>
  );
}
