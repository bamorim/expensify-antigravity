import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, LayoutDashboard, Settings, Users } from "lucide-react";
import { api } from "~/trpc/server";
import { cn } from "~/lib/utils";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const org = await api.organization.get({ id });

    const navItems = [
      {
        href: `/orgs/${id}`,
        label: "Dashboard",
        icon: LayoutDashboard,
      },
      {
        href: `/orgs/${id}/settings`,
        label: "Members & Settings",
        icon: Users,
      },
    ];

    return (
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-white">
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <Building2 className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-slate-900">{org.name}</span>
          </div>
          <nav className="space-y-1 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="absolute bottom-0 w-64 border-t p-4">
            <Link
              href="/orgs"
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
            >
              <Settings className="h-4 w-4" />
              Switch Organization
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          <header className="border-b bg-white">
            <div className="flex h-16 items-center justify-between px-8">
              <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-blue-600"></div>
                  <span className="font-bold text-slate-900">Expensify</span>
                </Link>
              </div>
            </div>
          </header>
          <main className="flex-1 bg-slate-50">{children}</main>
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}
