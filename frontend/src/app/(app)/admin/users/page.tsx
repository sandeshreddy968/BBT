"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { usersApi } from "@/lib/api/users";
import type { User } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/shared/DataTable";
import { Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { ApiError } from "@/lib/api/client";

export default function AdminUsersPage() {
  const { user: currentUser, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && currentUser && currentUser.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [currentUser, loading, router]);

  const load = () => {
    usersApi
      .list()
      .then(setUsers)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load users"));
  };

  useEffect(() => {
    if (currentUser?.role === "admin") load();
  }, [currentUser]);

  async function handleRoleChange(id: number, role: string) {
    try {
      await usersApi.update(id, { role });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update user");
    }
  }

  async function handleActiveToggle(id: number, is_active: boolean) {
    try {
      await usersApi.update(id, { is_active });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update user");
    }
  }

  return (
    <div>
      <PageHeader title="Users" description="Manage roles and account status." />
      <Card>
        {error && (
          <div className="p-4">
            <ErrorState message={error} />
          </div>
        )}
        {!users && !error && <LoadingState />}
        {users && (
          <DataTable
            rows={users}
            emptyMessage="No users found."
            columns={[
              { header: "Name", render: (u) => u.full_name },
              { header: "Email", render: (u) => u.email },
              {
                header: "Role",
                render: (u) => (
                  <Select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={u.id === currentUser?.id}
                    className="w-28"
                  >
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </Select>
                ),
              },
              {
                header: "Status",
                render: (u) => (
                  <button
                    onClick={() => handleActiveToggle(u.id, !u.is_active)}
                    disabled={u.id === currentUser?.id}
                  >
                    <Badge
                      className={
                        u.is_active
                          ? "bg-green-50 text-green-700 ring-green-200"
                          : "bg-gray-100 text-gray-700 ring-gray-200"
                      }
                    >
                      {u.is_active ? "Active" : "Disabled"}
                    </Badge>
                  </button>
                ),
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
