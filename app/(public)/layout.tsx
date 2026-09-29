"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 h-14 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md shadow-xs">
        <div className="container mx-auto flex h-full items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-9 w-14 shrink-0 overflow-hidden">
              <Image
                src="/logo.png"
                alt="Logo Kuttab Al-Fatih"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
            <div className="flex flex-col leading-tight border-l border-slate-200 pl-2.5">
              <span className="font-heading text-sm font-extrabold text-slate-900 tracking-tight">SiMas</span>
              <span className="text-[10px] text-slate-500 font-medium">
                Kuttab Al-Fatih Bandung
              </span>
            </div>
          </Link>

          <Link href="/login">
            <Button size="sm" className="h-8 px-4 font-bold text-xs shadow-xs">
              Masuk
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Compact & Sleek Footer */}
      <footer className="border-t border-slate-200 bg-slate-50/80 py-4 text-xs text-slate-600">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
            {/* Left: Brand info with Official Logo */}
            <div className="flex items-center gap-2.5">
              <div className="relative h-6 w-10 shrink-0">
                <Image
                  src="/logo.png"
                  alt="Logo Kuttab Al-Fatih"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="font-semibold text-slate-800 text-xs">
                SiMas <span className="font-normal text-slate-500 text-[11px]">— Kuttab Al-Fatih Bandung</span>
              </p>
            </div>

            {/* Middle: Inline navigation */}
            <div className="flex items-center gap-4 font-medium text-[11px] text-slate-600">
              <Link href="/" className="hover:text-primary transition-colors">
                Beranda
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/#fitur" className="hover:text-primary transition-colors">
                Fitur
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/login" className="hover:text-primary transition-colors">
                Masuk
              </Link>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">info@kuttabal-fatih.sch.id</span>
            </div>

            {/* Right: Copyright */}
            <div className="text-[11px] text-slate-400 font-medium">
              &copy; {new Date().getFullYear()} Kuttab Al-Fatih Bandung. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
