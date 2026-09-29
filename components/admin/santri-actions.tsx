"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, RotateCcw, AlertCircle, Loader2, X } from "lucide-react";

interface AdminSantriActionsProps {
  onImportSuccess?: () => void;
  onResetSuccess?: () => void;
  onReseedSuccess?: () => void;
}

export function AdminSantriActions({
  onImportSuccess,
  onResetSuccess,
  onReseedSuccess,
}: AdminSantriActionsProps) {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isReseedOpen, setIsReseedOpen] = useState(false);

  return (
    <>
      <ImportModal isOpen={isImportOpen} setIsOpen={setIsImportOpen} onSuccess={onImportSuccess} />
      <ConfirmModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={handleResetData(onResetSuccess)}
        title="Reset Semua Data"
        message="Ini akan menghapus SEMUA data santri, absensi, hafalan, perilaku, jurnal, kasus, dan notifikasi. Struktur data (kelas, halaqah, mapel) akan dipertahankan. Tindakan ini TIDAK DAPAT DIBATALKAN."
        confirmText="Ya, Hapus Semua Data"
        loadingText="Menghapus data..."
      />
      <ConfirmModal
        isOpen={isReseedOpen}
        onClose={() => setIsReseedOpen(false)}
        onConfirm={handleReseed(onReseedSuccess)}
        title="Reset & Seed Ulang"
        message="Ini akan menghapus SEMUA data termasuk user (admin, guru, manajemen) lalu membuat ulang data dasar: admin, guru, manajemen, kelas, halaqah, mapel. Tindakan ini TIDAK DAPAT DIBATALKAN."
        confirmText="Ya, Reset & Seed Ulang"
        loadingText="Mereset dan seeding..."
      />
      <div className="flex flex-wrap gap-2 mx-2 mb-4">
        <Button
          onClick={() => setIsImportOpen(true)}
          aria-label="Import data santri"
        >
          <Upload className="mr-2 h-4 w-4" />
          Import Data
        </Button>
        <Button
          variant="secondary"
          onClick={() => setIsResetOpen(true)}
          aria-label="Reset data"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Reset Data
        </Button>
        <Button
          variant="destructive"
          onClick={() => setIsReseedOpen(true)}
          aria-label="Reseed data"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset & Seed Ulang
        </Button>
      </div>
    </>
  );
}

function handleResetData(onSuccess?: () => void) {
  return async () => {
    try {
      const res = await fetch("/api/admin/reset-data", { method: "POST" });
      const data = await res.json();
      alert(data.message || "Data direset");
      onSuccess?.();
      window.location.reload();
    } catch (err) {
      alert("Error: " + err);
    }
  };
}

function handleReseed(onSuccess?: () => void) {
  return async () => {
    try {
      const res = await fetch("/api/admin/reseed", { method: "POST" });
      const data = await res.json();
      alert(data.message || "Database di-seed ulang");
      onSuccess?.();
      window.location.reload();
    } catch (err) {
      alert("Error: " + err);
    }
  };
}

function ImportModal({
  isOpen,
  setIsOpen,
  onSuccess,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess?: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setProgress(0);
      setStatus("Menyiapkan import...");
      importStudents(file);
    }
  };

  const importStudents = async (file: File) => {
    setStatus("Memulai import...");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/santri/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setStatus(`Import selesai: ${result.success} sukses, ${result.failed} gagal`);
        setFile(null);
        setTimeout(() => {
          onSuccess?.();
          window.location.reload();
        }, 2000);
      } else {
        setStatus(`Error: ${result.error || "Unknown error"}`);
      }
    } catch (err) {
      setStatus(`Gagal koneksi: ${err}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl font-bold">Import Santri</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="opacity-50">×</span>
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Format file: CSV atau Excel dengan kolom: NIS, Nama Lengkap, Jenjang, Level, Status, dll.
        </p>

        {progress > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Progress</p>
            <div className="bg-muted/20 rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-width"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-capitalize mt-1">{status}</p>
          </div>
        )}

        <form className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1">
              Pilih File
            </label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="w-full border rounded px-3 py-2"
            />
            {file && (
              <p className="text-xs text-primary mt-1">
                Dipilih: {file.name}
              </p>
            )}
          </div>

          <Button type="submit" disabled={progress > 0 || !file}>
            {progress > 0 ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-primary" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12s5.37 8 8 8h.586a2 2 0 011.414 1.414l3.293-3.293a2 2 0 011.414 1.414l-3.293 3.293z"
                  />
                </svg>
                Memproses...
              </span>
            ) : (
              "Mulai Import"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  loadingText,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  loadingText: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = () => {
    setIsLoading(true);
    onConfirm();
    setTimeout(() => {
      setIsLoading(false);
      onClose();
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <AlertCircle className="text-destructive text-2xl" />
          <h2 className="font-heading text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-6">{message}</p>

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin h-4 w-4" />
                {loadingText}
              </span>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}