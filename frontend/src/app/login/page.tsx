"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/shared/LoadingState";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-sm overflow-hidden p-0">
        <div className="h-1.5 bg-gradient-to-r from-brand-500 via-brand-400 to-brand-mist" />
        <div className="p-6">
          <div className="mb-1 flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm bg-brand-500" />
            <h1 className="text-lg font-semibold text-brand-charcoal">
              ByteBridge <span className="text-brand-600">ITSM</span>
            </h1>
          </div>
          <p className="mb-6 text-sm text-slate-500">Sign in to your account</p>
          {error && (
            <div className="mb-4">
              <ErrorState message={error} />
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@bytebridge.io"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-brand-600 underline">
              Register
            </Link>
          </p>
          <p className="mt-4 text-xs text-slate-400">
            Demo: admin@bytebridge.io / Admin123! · alice@bytebridge.io / Password123!
          </p>
        </div>
      </Card>
    </div>
  );
}
