"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertCircle,
  BookOpen,
  GitPullRequest,
  HelpCircle,
  LayoutDashboard,
  Server,
  ShoppingCart,
  Store,
  Users as UsersIcon,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/incidents", label: "Incidents", icon: AlertCircle },
  { href: "/problems", label: "Problems", icon: HelpCircle },
  { href: "/changes", label: "Changes", icon: GitPullRequest },
  { href: "/requests", label: "Requests", icon: ShoppingCart },
  { href: "/catalog", label: "Service Catalog", icon: Store },
  { href: "/knowledge", label: "Knowledge Base", icon: BookOpen },
  { href: "/cis", label: "CMDB", icon: Server },
];

const ADMIN_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin/users", label: "Users", icon: UsersIcon },
];

function NavLink({ item, active }: { item: { href: string; label: string; icon: LucideIcon }; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium ${
        active ? "bg-brand-500 text-white" : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
      <span className="whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        {item.label}
      </span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="group relative hidden h-screen w-16 shrink-0 md:block">
      <div className="absolute inset-y-0 left-0 z-20 flex w-16 flex-col overflow-hidden border-r border-slate-200 bg-white transition-[width] duration-200 ease-in-out group-hover:w-56 group-hover:shadow-xl">
        <div className="relative h-14 shrink-0 border-b border-slate-200">
          <div className="absolute inset-0 flex items-center px-4 opacity-100 transition-opacity duration-150 group-hover:opacity-0">
            <Image src="/brand/bytebridge-icon.png" alt="ByteBridge" width={256} height={256} className="h-7 w-7 object-contain" priority />
          </div>
          <div className="absolute inset-0 flex items-center px-4 opacity-0 transition-opacity delay-75 duration-200 group-hover:opacity-100">
            <Image src="/brand/bytebridge-logo.png" alt="ByteBridge" width={452} height={148} className="h-7 w-auto" priority />
          </div>
        </div>
        <nav className="space-y-0.5 overflow-hidden p-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={pathname === item.href || pathname.startsWith(item.href + "/")}
            />
          ))}
          {user?.role === "admin" && (
            <>
              <div className="mt-4 mb-1 whitespace-nowrap px-4 text-xs font-semibold uppercase tracking-wide text-slate-400 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                Admin
              </div>
              {ADMIN_ITEMS.map((item) => (
                <NavLink key={item.href} item={item} active={pathname.startsWith(item.href)} />
              ))}
            </>
          )}
        </nav>
      </div>
    </aside>
  );
}
