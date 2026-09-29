"use client";

import { createContext, useContext } from "react";

export type UserRole = "admin" | "guru" | "manajemen";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
});

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
