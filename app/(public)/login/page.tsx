"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { AlertCircle, CheckCircle2, Lock, Mail, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Role = "admin" | "guru" | "manajemen";

const ROLE_META: Record<Role, { label: string; email: string }> = {
  admin: { label: "Admin", email: "admin@kuttabal-fatih.sch.id" },
  guru: { label: "Guru", email: "rizki.firmansyah@kuttabal-fatih.sch.id" },
  manajemen: { label: "Manajemen", email: "hendra.wijaya@kuttabal-fatih.sch.id" },
};

const DEMO_PASSWORD = "password123";

export default function LoginPage() {
  const [role, setRole] = useState<Role>("guru");
  const [email, setEmail] = useState(ROLE_META.guru.email);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = (value: string) => {
    const nextRole = value as Role;
    setRole(nextRole);
    setEmail(ROLE_META[nextRole].email);
    setPassword(DEMO_PASSWORD);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      role,
      redirect: false,
    });

    if (result?.error) {
      setError("Email, password, atau role tidak sesuai. Silakan coba lagi.");
      setIsLoading(false);
      return;
    }

    window.location.href = `/${role}/dashboard`;
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 px-4 py-12">
      {/* Decorative ambient backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 size-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-96 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <Card className="relative z-10 w-full max-w-md shadow-card border-border/80 backdrop-blur-sm bg-card/95">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto flex justify-center mb-1">
            <div className="relative h-14 w-36">
              <Image
                src="/logo.png"
                alt="Logo Kuttab Al-Fatih"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <CardTitle className="font-heading text-xl font-bold tracking-tight text-slate-900">
            Masuk ke SiMas
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 font-medium">
            Sistem Informasi Manajemen Santri · Kuttab Al-Fatih Bandung
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-caption font-semibold text-foreground">Masuk Sebagai</Label>
            <Tabs value={role} onValueChange={handleRoleChange}>
              <TabsList className="grid w-full grid-cols-3 h-10 p-1 bg-muted/80">
                <TabsTrigger value="admin" className="text-body-xs font-medium">Admin</TabsTrigger>
                <TabsTrigger value="guru" className="text-body-xs font-medium">Guru</TabsTrigger>
                <TabsTrigger value="manajemen" className="text-body-xs font-medium">Manajemen</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-caption font-medium">Email Akun</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 text-body-sm"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-caption font-medium">Kata Sandi</Label>
                <Link href="/lupa-password" className="text-[11px] text-primary hover:underline font-medium">
                  Lupa kata sandi?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-10 text-body-sm"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-caption text-destructive animate-fade-in"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-10 font-medium" 
              isLoading={isLoading}
              loadingText="Memproses masuk..."
            >
              Masuk ke Aplikasi
            </Button>
          </form>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-1">
            <div className="flex items-start gap-2.5">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <div>
                <p className="text-caption font-bold text-amber-900 dark:text-amber-200">Mode Demo Cepat</p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                  Pilih tab role di atas untuk otomatis mengisi kredensial demo. Password default:{" "}
                  <code className="rounded bg-amber-200/60 dark:bg-amber-900/60 px-1 py-0.5 font-mono font-bold text-amber-950 dark:text-amber-100">
                    {DEMO_PASSWORD}
                  </code>
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] text-muted-foreground">
            Butuh bantuan? Hubungi Administrator SIMAS Kuttab Al-Fatih.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
