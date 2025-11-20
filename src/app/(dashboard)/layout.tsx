import Link from "next/link";
import { auth } from "~/server/auth";
import { UserNav } from "./_components/user-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/orgs" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600"></div>
              <span className="text-xl font-bold text-slate-900">
                Expensify
              </span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/orgs"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Organizations
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {session?.user && <UserNav user={session.user} />}
          </div>
        </div>
      </header>
      <main className="flex-1 bg-slate-50">{children}</main>
    </div>
  );
}
