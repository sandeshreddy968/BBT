"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/Button";

export function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="text-sm text-slate-500 md:hidden font-semibold text-slate-900">ByteBridge ITSM</div>
      <div className="ml-auto flex items-center gap-3">
        {user && (
          <span className="text-sm text-slate-600">
            {user.full_name} <span className="text-slate-400">({user.role})</span>
          </span>
        )}
        <Button variant="secondary" onClick={logout}>
          Log out
        </Button>
      </div>
    </header>
  );
}
