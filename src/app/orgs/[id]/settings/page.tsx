"use client";

import { useState, use } from "react";
import { api } from "~/trpc/react";
import { Role } from "@prisma/client";

export default function OrganizationSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>(Role.MEMBER);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  const { data: members, refetch: refetchMembers } =
    api.organization.getMembers.useQuery({
      organizationId: id,
    });

  const inviteMember = api.organization.inviteMember.useMutation({
    onSuccess: (data) => {
      setInviteSuccess(`Invitation link generated: /invites/${data.token} `); // In real app, this would be sent via email
      setInviteEmail("");
      setInviteError("");
    },
    onError: (e) => {
      setInviteError(e.message);
      setInviteSuccess("");
    },
  });

  const removeMember = api.organization.removeMember.useMutation({
    onSuccess: () => {
      void refetchMembers();
    },
  });

  const updateMemberRole = api.organization.updateMemberRole.useMutation({
    onSuccess: () => {
      void refetchMembers();
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    inviteMember.mutate({
      organizationId: id,
      email: inviteEmail,
      role: inviteRole,
    });
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-3xl font-bold">Organization Settings</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Invite Member Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Invite Member</h2>
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="colleague@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as Role)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value={Role.MEMBER}>Member</option>
                <option value={Role.ADMIN}>Admin</option>
              </select>
            </div>

            {inviteError && (
              <div className="text-sm text-red-500">{inviteError}</div>
            )}

            {inviteSuccess && (
              <div className="rounded-md bg-green-50 p-3 text-sm break-all text-green-600">
                {inviteSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={inviteMember.isPending}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {inviteMember.isPending ? "Sending Invite..." : "Send Invite"}
            </button>
          </form>
        </div>

        {/* Members List Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Members</h2>
          <div className="space-y-4">
            {members?.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-md bg-gray-50 p-3"
              >
                <div>
                  <p className="font-medium">
                    {member.user.name ?? member.user.email}
                  </p>
                  <p className="text-sm text-gray-500">{member.user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={member.role}
                    onChange={(e) =>
                      updateMemberRole.mutate({
                        organizationId: id,
                        userId: member.userId,
                        role: e.target.value as Role,
                      })
                    }
                    className="rounded-md border-gray-300 text-sm"
                    disabled={updateMemberRole.isPending}
                  >
                    <option value={Role.MEMBER}>Member</option>
                    <option value={Role.ADMIN}>Admin</option>
                  </select>

                  <button
                    onClick={() =>
                      removeMember.mutate({
                        organizationId: id,
                        userId: member.userId,
                      })
                    }
                    className="text-sm text-red-600 hover:text-red-800"
                    disabled={removeMember.isPending}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
