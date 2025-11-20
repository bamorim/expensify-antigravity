import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { ProfileForm } from "./_components/profile-form";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
        <p className="text-slate-600">Manage your personal information</p>
      </div>

      <div className="max-w-2xl rounded-lg bg-white p-6 shadow-sm">
        <ProfileForm user={session.user} />
      </div>
    </div>
  );
}
