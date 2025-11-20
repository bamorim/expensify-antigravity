import Link from "next/link";
import { api } from "~/trpc/server";

export default async function OrganizationsPage() {
  const organizations = await api.organization.list();

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Organizations</h1>
        <Link
          href="/orgs/create"
          className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          Create New Organization
        </Link>
      </div>

      {organizations.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 py-20 text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-700">
            No organizations found
          </h2>
          <p className="mb-6 text-gray-500">
            You haven&apos;t joined any organizations yet.
          </p>
          <Link
            href="/orgs/create"
            className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Create your first organization
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <Link
              key={org.id}
              href={`/orgs/${org.id}`}
              className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <h2 className="mb-2 text-xl font-semibold">{org.name}</h2>
              <p className="text-sm text-gray-500">
                {org.members.length} member{org.members.length !== 1 && "s"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
