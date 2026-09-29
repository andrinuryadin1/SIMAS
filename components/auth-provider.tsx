"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ReactNode } from "react";
import { AuthContext, AuthUser, UserRole } from "@/components/auth-context";

const ROLES: UserRole[] = ["admin", "guru", "manajemen"];

function SessionUserBridge({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  let user: AuthUser | null = null;
  if (session?.user) {
    const sessionUser = session.user as typeof session.user & {
      id?: string;
      role?: string;
    };
    const role = ROLES.includes(sessionUser.role as UserRole)
      ? (sessionUser.role as UserRole)
      : null;

    user = {
      id: sessionUser.id ?? sessionUser.email ?? "",
      fullName: sessionUser.name ?? "",
      email: sessionUser.email ?? "",
      role: role as UserRole,
      avatarUrl: sessionUser.image ?? undefined,
    };
  }

  return (
    <AuthContext.Provider value={{ user, loading: status === "loading" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SessionUserBridge>{children}</SessionUserBridge>
    </SessionProvider>
  );
}
