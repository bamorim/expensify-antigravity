"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { useState, use } from "react";

export default function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [status, setStatus] = useState<
    "idle" | "accepting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const acceptInvitation = api.organization.acceptInvitation.useMutation({
    onSuccess: () => {
      setStatus("success");
      setTimeout(() => {
        router.push("/orgs");
      }, 2000);
    },
    onError: (e) => {
      setStatus("error");
      setErrorMessage(e.message);
    },
  });

  const handleAccept = () => {
    setStatus("accepting");
    acceptInvitation.mutate({ token });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
        <h1 className="mb-4 text-2xl font-bold">Organization Invitation</h1>

        {status === "idle" && (
          <>
            <p className="mb-6 text-gray-600">
              You have been invited to join an organization.
            </p>
            <button
              onClick={handleAccept}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Accept Invitation
            </button>
          </>
        )}

        {status === "accepting" && (
          <p className="text-blue-600">Processing invitation...</p>
        )}

        {status === "success" && (
          <div className="text-green-600">
            <p className="mb-2 font-semibold">Successfully joined!</p>
            <p className="text-sm">Redirecting you to your organizations...</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-red-500">
            <p className="mb-2 font-semibold">Failed to accept invitation</p>
            <p className="text-sm">{errorMessage}</p>
            <button
              onClick={() => router.push("/orgs")}
              className="mt-4 text-sm text-blue-600 hover:underline"
            >
              Go to Organizations
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
