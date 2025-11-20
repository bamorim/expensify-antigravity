import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import { Role } from "@prisma/client";

export default async function OrganizationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const org = await api.organization.get({ id });
    const currentUser = await api.user.me();

    const isAdmin = org.members.some(
      (m) => m.userId === currentUser?.id && m.role === Role.ADMIN,
    );

    return (
      <div className="container mx-auto py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{org.name}</h1>
            <p className="text-gray-500">Organization Dashboard</p>
          </div>
          {isAdmin && (
            <Link
              href={`/orgs/${id}/settings`}
              className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
            >
              Settings & Members
            </Link>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Placeholder for future dashboard widgets */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">Members</h3>
            <p className="text-3xl font-bold">{org.members.length}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">Projects</h3>
            <p className="text-3xl font-bold">0</p>
            <p className="mt-1 text-sm text-gray-500">Coming soon</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">Recent Activity</h3>
            <p className="text-sm text-gray-500">No recent activity</p>
          </div>
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}
