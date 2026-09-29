# Sistem Informasi Manajemen Santri (SiMas)

---

## 1. Ringkasan & Tujuan Aplikasi
*Bagian ini menjelaskan gambaran umum proyek agar dipahami bersama oleh pemilik ide/klien dan tim pengembang.*
- **Nama Aplikasi**: Sistem Informasi Manajemen Santri (SiMas)
- **Penjelasan Singkat**: SiMas adalah platform digital terpusat untuk Kuttab Al-Fatih Bandung yang merekam dan menyajikan rekam jejak lengkap setiap santri — mulai dari identitas, absensi, hafalan Qur'an, perkembangan berhitung, calistung, adab & akhlak, hingga catatan kasus khusus — sehingga Manajemen dapat menilai tumbuh kembang santri dalam satu klik saja.
- **Masalah yang Diselesaikan**:
  - Data santri tersebar di buku catatan guru, spreadsheet manual, dan dokumen fisik, sehingga sulit ditelusuri secara menyeluruh.
  - Manajemen tidak memiliki visibilitas real-time terhadap perkembangan tiap santri antar kelas dan antar angkatan.
  - Riwayat khusus (kasus perilaku/akademik) tidak terdokumentasi rapi sehingga penanganannya tidak konsisten.
  - Guru kesulitan melaporkan perkembangan mingguan secara terstruktur dan tepat waktu.
  - Pengaturan data master (kelas, halaqah, mapel) tidak terpusat, sering terjadi duplikasi data.
- **Pengguna Aplikasi**:
  - **Admin**: Mengelola seluruh akun pengguna (Admin, Guru, Manajemen), mengatur data master (Kelas, Halaqah, Mapel, Santri), mengonfigurasi jadwal reminder mingguan, dan mengelola seluruh konten sistem.
  - **Guru**: Menginput data harian santri (absensi, setoran hafalan, catatan perilaku, jurnal mengajar, penilaian adab & sikap, perkembangan berhitung & calistung) untuk halaqah/kelas yang dibina.
  - **Manajemen**: Memantau rekam jejak dan performa santri secara keseluruhan, melihat statistik per kelas/angkatan, mengevaluasi guru, serta mengambil keputusan strategis berbasis data.
- **Target Keberhasilan**:
  - 100% santri aktif memiliki profil rekam jejak digital yang lengkap dan dapat diakses Manajemen dalam < 3 klik dari dashboard.
  - Guru mengisi data perkembangan harian minimal 95% dari hari sekolah per bulan.
  - Pengisian laporan mingguan oleh Guru tercapai tepat waktu (≥ 90% sebelum deadline reminder).
  - Manajemen dapat menghasilkan laporan perkembangan per kelas/angkatan dalam waktu < 1 menit tanpa bantuan tim IT.
  - Penurunan jumlah kasus perilaku berulang sebesar 30% dalam 6 bulan setelah sistem berjalan (karena terdeteksi dini).

---

## 2. Batasan Pembuatan Sistem (Versi Awal MVP)
*Menegaskan fitur apa yang dikerjakan di versi awal dan apa yang sengaja ditunda agar aplikasi cepat selesai dan tidak membengkak (mencegah scope creep).*
### ✅ Yang Dikerjakan:
- Autentikasi 3 role (Admin, Guru, Manajemen) dengan akun dibuat oleh Admin (email & password).
- Profil 360° santri: identitas, wali, kelas, halaqah, dan status keaktifan.
- Input absensi harian santri oleh Guru (Hadir, Sakit, Izin, Alpha, Terlambat).
- Input setoran hafalan Qur'an (surah, ayat, juz, nilai kualitas, catatan guru).
- Penilaian sikap & adab harian (skala nilai + catatan kualitatif).
- Catatan Akhlak & Perilaku (baik dan pelanggaran) dengan kategori dan tingkat keparahan.
- Perkembangan Berhitung (numerasi) dan Calistung (baca-tulis) per periode.
- Jurnal / materi mengajar harian oleh Guru.
- Riwayat khusus (kasus) — pencatatan, tindak lanjut, dan status penyelesaian.
- Dashboard Manajemen: monitoring per santri, statistik per kelas/angkatan.
- Manajemen data master: Kelas, Halaqah, Mapel, Santri, Tahun Ajaran.
- In-app notification: reminder mingguan ke Guru + notifikasi aktivitas.
- Konfigurasi jadwal reminder mingguan oleh Admin (hari & jam).
- Export laporan rekam jejak santri ke PDF.
- Pencarian & filter lanjutan santri (nama, kelas, halaqah, status).

### ⛔ Yang Tidak Dikerjakan di Versi Awal:
- Portal login terpisah untuk Wali Murid (akan menjadi rilis versi berikutnya).
- Integrasi WhatsApp / Email otomatis (hanya in-app notification di MVP).
- Aplikasi mobile native iOS/Android (fokus pada responsive web terlebih dahulu).
- Video streaming materi pengajian via Bunny Stream (Bab integrasi konten video masuk backlog).
- Chat internal antar guru dan manajemen.
- Upload dan OCR dokumen rapor fisik.
- Pembayaran SPP / payment gateway (tidak relevan untuk MVP SiMas).
- Modul keuangan, payroll guru, dan administrasi sarana-prasarana.

---

## 3. Daftar Halaman & Struktur Menu (Pages & Routing)
*Daftar lengkap halaman yang harus dibuat, dikelompokkan berdasarkan area atau peran pengguna (Role).*
### A. Public Area (Tanpa Login)
- `/` (Landing Page): Menampilkan logo Kuttab Al-Fatih Bandung, hero section penjelasan SiMas, keunggulan sistem, dan tombol "Masuk ke SiMas".
- `/login` (Halaman Login): Form login email & password untuk ketiga role. Redirect otomatis ke dashboard sesuai role setelah berhasil.
- `/lupa-password` (Lupa Password): Form input email untuk permintaan reset password.

### B. Admin Area (Setelah Login)
- `/admin/dashboard` (Dasbor Admin): Ringkasan total santri, guru, kelas, dan shortcut ke pengelolaan akun.
- `/admin/users` (Kelola Pengguna): Tabel daftar akun (Admin, Guru, Manajemen) dengan aksi buat, edit, nonaktifkan, reset password.
- `/admin/users/tambah` (Tambah Pengguna): Form lengkap data akun + penugasan role.
- `/admin/santri` (Kelola Santri): Tabel CRUD santri dengan filter kelas, halaqah, status, tahun ajaran.
- `/admin/santri/:id` (Detail Santri Admin): Form lengkap identitas santri + wali + penempatan.
- `/admin/master/kelas` (Data Master Kelas): CRUD kelas (nama, jenjang, tahun ajaran, wali kelas).
- `/admin/master/halaqah` (Data Master Halaqah): CRUD halaqah (nama, guru pembina, kelas).
- `/admin/master/mapel` (Data Master Mata Pelajaran): CRUD mapel (nama, kategori: Tahfidz, Adab, Calistung, Berhitung).
- `/admin/master/tahun-ajaran` (Tahun Ajaran): CRUD tahun ajaran dan periode semester.
- `/admin/pengaturan/reminder` (Pengaturan Reminder): Konfigurasi hari, jam, dan aktivasi reminder mingguan untuk Guru.
- `/admin/notifikasi` (Log Notifikasi): Riwayat pengiriman in-app notification.
- `/admin/profil` (Profil Admin): Edit profil pribadi dan ganti password.

### C. Guru Area (Setelah Login)
- `/guru/dashboard` (Dasbor Guru): Ringkasan halaqah yang dibina, santri aktif, tugas mingguan yang belum selesai, dan notifikasi reminder.
- `/guru/absensi` (Input Absensi Harian): Form pilih tanggal + halaqah, input status absensi per santri.
- `/guru/hafalan` (Setoran Hafalan Qur'an): Form input surah, ayat, juz, penilaian kualitas, dan catatan.
- `/guru/adab` (Penilaian Sikap & Adab): Nilai sikap harian per santri dengan indikator kategori.
- `/guru/perilaku` (Catatan Akhlak & Pelanggaran): Log perilaku baik dan pelanggaran dengan tingkat keparahan.
- `/guru/perkembangan` (Perkembangan Berhitung & Calistung): Input capaian numerasi & literasi per periode.
- `/guru/jurnal` (Jurnal Mengajar): Catatan materi, metode, dan evaluasi kelas harian.
- `/guru/kasus` (Riwayat Khusus / Kasus): Laporan kasus khusus dan tindak lanjut.
- `/guru/santri` (Santri Saya): Daftar santri di halaqah yang dibina, bisa klik ke detail rekam jejak (read-only).
- `/guru/santri/:id` (Detail Santri Guru): Rekam jejak santri yang dibina (baca + input untuk data miliknya).
- `/guru/profil` (Profil Guru): Edit profil pribadi dan ganti password.

### D. Manajemen Area (Setelah Login)
- `/manajemen/dashboard` (Dasbor Eksekutif): Statistik global — total santri, distribusi per kelas/angkatan, tren absensi, ringkasan kasus.
- `/manajemen/santri` (Buku Induk Santri): Tabel santri dengan filter lanjutan (kelas, halaqah, angkatan, status).
- `/manajemen/santri/:id` (Rekam Jejak 360° Santri): Halaman utama tujuan aplikasi — semua data santri dalam satu tampilan tab.
- `/manajemen/analitik` (Statistik & Analitik): Grafik per kelas, per angkatan, tren perkembangan hafalan, distribusi adab.
- `/manajemen/guru` (Monitoring Guru): Statistik kinerja guru (jumlah input, kelengkapan laporan mingguan).
- `/manajemen/kasus` (Monitoring Kasus): Daftar seluruh kasus santri lintas kelas dengan status tindak lanjut.
- `/manajemen/laporan` (Laporan & Export): Generate laporan per kelas/angkatan/periode, export PDF/Excel.
- `/manajemen/notifikasi` (Notifikasi Manajemen): In-app notification aktivitas penting.
- `/manajemen/profil` (Profil Manajemen): Edit profil pribadi dan ganti password.

### E. Shared Area (Semua Role Login)
- `/notifikasi` (Pusat Notifikasi): Semua in-app notification untuk user login.
- `/akses-ditolak` (403 Forbidden): Halaman kustom ketika role tidak punya akses.

---

## 4. Pedoman UI/UX & Design System
*Panduan visual konkret agar AI coding assistant tidak membuat UI yang kaku atau default.*
- **Skema Warna (Corporate & Professional)**:
  - Primary (Emerald Deep): HSL(158, 64%, 26%) — warna utama identitas islami-profesional.
  - Primary Foreground: HSL(0, 0%, 100%)
  - Secondary (Slate Navy): HSL(215, 28%, 21%) — untuk heading dan teks utama.
  - Accent (Amber Gold): HSL(38, 92%, 50%) — untuk highlight dan CTA sekunder.
  - Muted: HSL(210, 40%, 96%) — background section lembut.
  - Border: HSL(214, 32%, 91%)
  - Background: HSL(0, 0%, 100%)
  - Foreground: HSL(222, 47%, 11%)
  - Destructive: HSL(0, 72%, 51%) — untuk kasus pelanggaran berat.
  - Success: HSL(142, 71%, 45%) — untuk capaian baik.
  - Warning: HSL(38, 92%, 50%) — untuk peringatan ringan.
- **Tipografi**:
  - Heading: Font **'Plus Jakarta Sans'** (weight 600/700) — clean, korporat, mudah dibaca.
  - Body: Font **'Inter'** (weight 400/500) — readability tinggi untuk tabel dan laporan.
  - Angka & Data: Font **'JetBrains Mono'** untuk kolom nilai/kode santri agar sejajar rapi.
  - Base size: 16px, line-height 1.6 untuk body.
- **Aturan Komponen**:
  - Sudut: `rounded-lg` (8px) untuk tombol & input, `rounded-xl` (12px) untuk kartu dan modal.
  - Shadow: `shadow-sm` untuk kartu biasa, `shadow-md` saat hover, `shadow-lg` untuk modal/dialog.
  - Border: 1px solid `border` color pada semua card dan tabel.
  - Tabel: Header background `muted`, baris genap `background-muted/50` (zebra striping ringan), hover `accent/5`.
  - Button Primary: solid primary color, height 40px (default), 36px (sm), 48px (lg).
  - Badge Status: warna konsisten — Success (Hadir/Lulus), Warning (Izin/Terlambat), Destructive (Alpha/Pelanggaran), Muted (Nonaktif).
- **Nuansa & Vibe**: Korporat, formal, rapi, dan terpercaya. Gunakan banyak whitespace, grid kaku dengan jarak konsisten (gap-6 di desktop, gap-4 di mobile). Minim micro-animation — cukup transisi halus 150ms pada hover dan loading skeleton. Tidak ada elemen playful/rounded berlebihan. Elemen islami halus hanya di logo & pattern background header.

---

## 5. Pembagian Hak Akses Pengguna
*Tabel hak akses yang menentukan siapa saja yang boleh melihat, mengedit, atau mengelola data.*

| Menu / Halaman | Publik (Tanpa Login) | Guru | Manajemen | Admin |
| :--- | :---: | :---: | :---: | :---: |
| Landing Page `/` | ✅ | ✅ | ✅ | ✅ |
| Halaman Login `/login` | ✅ | ❌ | ❌ | ❌ |
| Dasbor Utama (per role) | ❌ | ✅ (Guru) | ✅ (Manajemen) | ✅ (Admin) |
| Profil Santri — Lihat (read) | ❌ | ✅ (halaqah sendiri) | ✅ (semua santri) | ✅ (semua santri) |
| Input Absensi Harian | ❌ | ✅ | ❌ | ✅ |
| Input Setoran Hafalan | ❌ | ✅ | ❌ | ✅ |
| Input Penilaian Adab & Sikap | ❌ | ✅ | ❌ | ✅ |
| Input Catatan Perilaku | ❌ | ✅ | ❌ | ✅ |
| Input Perkembangan Berhitung & Calistung | ❌ | ✅ | ❌ | ✅ |
| Input Jurnal Mengajar | ❌ | ✅ | ❌ | ✅ |
| Laporan Kasus Khusus | ❌ | ✅ (buat + lihat sendiri) | ✅ (lihat semua) | ✅ (kelola semua) |
| Statistik & Analitik Per Kelas/Angkatan | ❌ | ❌ | ✅ | ✅ |
| Monitoring Kinerja Guru | ❌ | ❌ | ✅ | ✅ |
| Export Laporan PDF/Excel | ❌ | ❌ | ✅ | ✅ |
| Kelola Akun Pengguna | ❌ | ❌ | ❌ | ✅ |
| Kelola Data Master (Kelas, Halaqah, Mapel) | ❌ | ❌ | ❌ | ✅ |
| Pengaturan Reminder Mingguan | ❌ | ❌ | ❌ | ✅ |
| In-App Notification | ❌ | ✅ | ✅ | ✅ |

---

## 6. Alur Kerja dan Fitur Utama
*Menjelaskan cara kerja setiap fitur utama dalam bahasa yang mudah dipahami serta aturan logikanya.*

### A. Modul Autentikasi & Manajemen Akun (Akun Dibuat Admin)
1. **Cara Kerja**:
   - Admin membuka halaman `/admin/users/tambah`, mengisi nama, email, password sementara, dan memilih role (Admin/Guru/Manajemen), lalu menyimpan.
   - Sistem membuat akun melalui Clerk menggunakan Admin API, dan menyimpan metadata role di tabel `users` pada database.
   - Pengguna menerima email undangan/reset password, login di `/login`, dan wajib mengganti password saat login pertama.
   - Semua role masuk melalui halaman login yang sama — sistem otomatis me-redirect ke dashboard yang sesuai berdasarkan role yang tersimpan di metadata Clerk + tabel `users`.
2. **Aturan Sistem**:
   - Email wajib unik dan berformat valid (validasi Zod).
   - Password default minimal 8 karakter, wajib ganti saat login pertama (flag `mustChangePassword`).
   - Nonaktifkan akun = ubah `status` menjadi `inactive` dan hapus session di Clerk.
   - Tidak ada form registrasi mandiri — semua akun dibuat oleh Admin.

### B. Modul Profil & Rekam Jejak 360° Santri (Fitur Inti Manajemen)
1. **Cara Kerja**:
   - Manajemen membuka `/manajemen/santri`, menggunakan search bar atau filter (kelas, halaqah, angkatan, status), lalu klik salah satu santri.
   - Halaman `/manajemen/santri/:id` menampilkan profil lengkap dalam tab: **Identitas**, **Absensi**, **Hafalan Qur'an**, **Berhitung**, **Calistung**, **Adab & Akhlak**, **Perilaku & Pelanggaran**, **Riwayat Khusus (Kasus)**, **Jurnal Terkait**.
   - Setiap tab menampilkan data kronologis dengan filter periode (bulan/semester/tahun ajaran).
   - Manajemen dapat mengunduh laporan PDF rekam jejak lengkap dalam satu klik.
2. **Aturan Sistem**:
   - Data hanya bisa dilihat (read-only) oleh Manajemen dari halaman ini (input tetap di Guru).
   - Setiap perubahan data oleh Guru tercatat di `activity_log` (audit trail).
   - Semua tab memuat data dari database real-time (server component + revalidate).

### C. Modul Input Absensi Harian (Guru)
1. **Cara Kerja**:
   - Guru membuka `/guru/absensi`, memilih tanggal (default hari ini) dan halaqah yang dibina.
   - Sistem menampilkan daftar santri aktif di halaqah tersebut dengan tombol status: Hadir, Terlambat, Sakit, Izin, Alpha.
   - Guru mengisi seluruh status, menambahkan catatan opsional, lalu klik "Simpan Absensi".
   - Sistem menyimpan batch record ke tabel `attendance`.
2. **Aturan Sistem**:
   - Satu santri hanya boleh memiliki satu record per tanggal per halaqah (unique constraint).
   - Jika absensi sudah diisi hari itu, sistem menampilkan data untuk diedit (mode update).
   - Alpha otomatis memicu in-app notification ke Manajemen jika melebihi 3 kali berturut-turut.

### D. Modul Setoran Hafalan Qur'an (Guru)
1. **Cara Kerja**:
   - Guru membuka `/guru/hafalan`, memilih santri & tanggal, mengisi: surah, ayat awal-akhir, juz, jenis setoran (Ziyadah/Murojaah), nilai kualitas (A/B/C/D), dan catatan.
   - Sistem menyimpan ke tabel `quran_memorization` dan memperbarui total juz tersimpan di profil santri.
2. **Aturan Sistem**:
   - Nilai kualitas hanya boleh A/B/C/D.
   - Surah dan ayat divalidasi terhadap reference list Al-Qur'an (1-114 surah).
   - Total juz santri dihitung otomatis dari akumulasi ayat yang lulus (nilai A/B).

### E. Modul Penilaian Adab, Sikap & Perilaku (Guru)
1. **Cara Kerja**:
   - Guru membuka `/guru/adab`, memilih periode (harian/mingguan), dan menilai setiap santri pada indikator: Kejujuran, Kemandirian, Akhlak sesama, Kebersihan, Kedisiplinan (skala 1-4).
   - Guru membuka `/guru/perilaku` untuk mencatat kejadian spesifik — baik perilaku positif (contoh: "Membantu teman tanpa diminta") maupun pelanggaran (contoh: "Tidak mengerjakan tugas hafalan"). Setiap catatan memiliki kategori, tingkat keparahan (Ringan/Sedang/Berat), dan tindakan guru.
2. **Aturan Sistem**:
   - Nilai adab skala 1-4, wajib mengisi catatan kualitatif jika nilai ≤ 2.
   - Pelanggaran dengan tingkat "Berat" otomatis mengirim notifikasi ke Manajemen.
   - Pelanggaran "Berat" wajib memiliki `followUpAction` sebelum bisa disimpan.

### F. Modul Perkembangan Berhitung & Calistung (Guru)
1. **Cara Kerja**:
   - Guru membuka `/guru/perkembangan`, memilih santri & periode (misalnya: "Semester Ganjil 2025/2026").
   - Menginput capaian numerasi: mengenal angka, penjumlahan, pengurangan, hitung cepat.
   - Menginput capaian calistung: mengenal huruf, membaca suku kata, membaca lancar, menulis.
   - Setiap aspek diberi status capaian (Belum, Sedang Berkembang, Berkembang, Mahir) dan catatan.
2. **Aturan Sistem**:
   - Satu santri hanya boleh memiliki satu record per periode per aspek (unique constraint).
   - Edit diizinkan selama periode masih aktif.

### G. Modul Jurnal Mengajar (Guru)
1. **Cara Kerja**:
   - Guru membuka `/guru/jurnal`, memilih tanggal & mapel, mengisi topik, metode, ringkasan materi, kendala, dan refleksi.
2. **Aturan Sistem**:
   - Satu jurnal per hari per mapel per halaqah.
   - Jurnal otomatis terhubung ke Mapel dari data master.

### H. Modul Riwayat Khusus / Kasus (Guru & Manajemen)
1. **Cara Kerja**:
   - Guru melaporkan kasus khusus (contoh: sakit berkepanjangan, kendala keluarga, kejadian berat) di `/guru/kasus`.
   - Manajemen memantau seluruh kasus di `/manajemen/kasus` dengan filter status: Open, In-Progress, Resolved.
   - Manajemen dapat menambahkan catatan tindak lanjut dan mengubah status.
2. **Aturan Sistem**:
   - Kasus baru selalu berstatus "Open".
   - Kasus "Resolved" wajib memiliki catatan penyelesaian.
   - Kasus yang sama tidak boleh diduplikasi tanpa penutupan kasus sebelumnya.

### I. Modul Monitoring & Analitik (Manajemen)
1. **Cara Kerja**:
   - Manajemen membuka `/manajemen/analitik` untuk melihat grafik: tren hafalan per kelas, distribusi nilai adab, persentase kehadiran, jumlah kasus aktif.
   - Filter tersedia: tahun ajaran, kelas, halaqah, periode.
   - Manajemen dapat mengunduh data mentah (Excel) atau laporan siap cetak (PDF).
2. **Aturan Sistem**:
   - Semua grafik dibangun dengan Recharts/Chart.js.
   - Data cached 5 menit untuk performa, dengan tombol "Refresh" manual.

### J. Modul Reminder Mingguan & Notifikasi In-App (Admin & Semua Role)
1. **Cara Kerja**:
   - Admin membuka `/admin/pengaturan/reminder`, memilih hari (contoh: Kamis), jam (contoh: 14:00), zona waktu (Asia/Jakarta), dan status aktif.
   - Sistem (via cron job / Vercel Cron / API route terproteksi) memeriksa jadwal harian dan mengirim in-app notification ke seluruh Guru yang belum melengkapi input perkembangan mingguan.
   - Guru melihat notifikasi di icon bell pada Header atau `/notifikasi`.
   - Notifikasi juga dipicu oleh event: sisipan absensi Alpha > 3 hari, pelanggaran berat, kasus baru, dan update data master.
2. **Aturan Sistem**:
   - Selain reminder mingguan, sistem mengirim notifikasi harian ke Guru jika masih ada absensi yang belum diisi (maksimal 1 kali per hari per guru).
   - Admin dapat menjeda reminder selama libur semester.
   - Semua notifikasi tersimpan di tabel `notifications` (read/unread) dan dapat di-mark as read.

---

## 7. Alur Navigasi & Arsitektur Layout
*Peta navigasi alur halaman dan struktur tata letak (layout).*

### Arsitektur Layout (Persisten)
- **Public Layout**: Header navbar statis di atas (logo + tombol "Masuk"), footer ringkas. Dipakai di `/`, `/login`, `/lupa-password`.
- **Dashboard Layout**: Sidebar kiri (fixed, lebar 260px, collapsible) berisi menu sesuai role + Header kecil di atas (breadcrumb, search global, icon notifikasi, dropdown profil). Area konten utama menggunakan grid responsif.
- **Role-Based Sidebar**: Menu sidebar dirender dinamis berdasarkan role — Admin melihat menu master & user, Guru melihat menu input harian, Manajemen melihat menu analitik & buku induk.

### Bagan Alur (Flowchart)
```mermaid
flowchart TD
    A[Pengunjung] --> B[Landing Page /]
    B --> C[/login]
    C --> D{Autentikasi Clerk}
    D -- Gagal --> C
    D -- Berhasil --> E{Role?}
    E -- Admin --> F[Admin Dashboard]
    E -- Guru --> G[Guru Dashboard]
    E -- Manajemen --> H[Manajemen Dashboard]

    F --> F1[Kelola Users]
    F --> F2[Kelola Santri]
    F --> F3[Master: Kelas/Halaqah/Mapel]
    F --> F4[Pengaturan Reminder]

    G --> G1[Absensi Harian]
    G --> G2[Setoran Hafalan]
    G --> G3[Adab & Perilaku]
    G --> G4[Berhitung & Calistung]
    G --> G5[Jurnal Mengajar]
    G --> G6[Kasus Khusus]
    G1 --> DB[(Neon PostgreSQL)]
    G2 --> DB
    G3 --> DB
    G4 --> DB
    G5 --> DB
    G6 --> DB

    H --> H1[Buku Induk Santri]
    H1 --> H2[Rekam Jejak 360 Santri /:id]
    H2 --> H3[Identitas]
    H2 --> H4[Absensi]
    H2 --> H5[Hafalan]
    H2 --> H6[Adab & Perilaku]
    H2 --> H7[Kasus]
    H --> H8[Analitik Per Kelas/Angkatan]
    H --> H9[Monitoring Guru]
    H --> H10[Laporan & Export PDF]

    DB --> CRON[Vercel Cron - Reminder Mingguan]
    CRON --> NOTIF[In-App Notification]
    NOTIF --> G
    NOTIF --> H
    NOTIF --> F
```

---

## 8. Kebutuhan Non-Fungsional (SEO, Keamanan, & Performa)
*Syarat wajib agar website siap rilis ke publik (production-ready).*
- **SEO**:
  - Wajib menggunakan tag `<title>` dinamis via Next.js Metadata API pada landing page dan halaman publik.
  - Meta description, Open Graph (OG) tags, dan Twitter Card untuk landing page `/` dan `/login`.
  - `robots.txt` mencegah crawling area `/admin`, `/guru`, `/manajemen`, `/dashboard`.
  - Sitemap otomatis untuk halaman publik.
- **Keamanan**:
  - Autentikasi via Clerk dengan proteksi session terenkripsi.
  - Middleware Next.js untuk memvalidasi role sebelum mengakses rute privat (`/admin/*`, `/guru/*`, `/manajemen/*`).
  - Validasi input server-side wajib menggunakan **Zod schema** di setiap Server Action & API Route.
  - Sanitasi output HTML untuk mencegah XSS, terutama pada field catatan bebas (perilaku, jurnal, kasus).
  - CSRF protection bawaan Server Actions Next.js 15.
  - Rate limiting pada endpoint `/login` dan endpoint cron reminder (header secret token).
  - Audit log (`activity_log`) untuk semua operasi Create/Update/Delete pada entitas utama.
  - Enkripsi password handle sepenuhnya oleh Clerk (SiMas tidak menyimpan password lokal).
- **Performa**:
  - Optimasi gambar dengan Next.js `<Image>`.
  - Server Components untuk rendering data berat; Client Components hanya untuk modul interaktif (form, filter, tabel sortable).
  - Lazy loading komponen berat (chart analitik, PDF viewer).
  - Caching `unstable_cache` untuk query statistik yang sering dipanggil (TTL 5 menit).
  - Index database pada kolom pencarian (`student_id`, `class_id`, `halaqah_id`, `date`, `created_at`).
  - Pagination server-side di semua tabel (default 20 baris per halaman).
  - Bunny Stream/CDN untuk aset statis (logo, ilustrasi) — disiapkan sejak MVP, aktif penuh saat modul video masuk.

---

## 9. Panduan Bahasa, Copywriting, & Data Dummy
*Panduan nada bicara (Tone of Voice) dan contoh data agar prototipe terasa nyata.*
- **Gaya Bahasa**: Formal, profesional, islami, dan membumi. Menggunakan kata "Anda" untuk pengguna dan "Kami" untuk sistem/Kuttab. Menghindari jargon teknis di UI. Contoh tone: _"Assalamu'alaikum, Ustadz. Berikut ringkasan perkembangan santri halaqah Anda pekan ini."_
- **Instruksi Data Dummy**: JANGAN PERNAH MENGGUNAKAN "Lorem Ipsum". Selalu gunakan data dummy berbahasa Indonesia yang relevan dengan konteks Kuttab. Berikut contoh spesifik untuk entitas utama:
  - **Santri**: Ahmad Zaki Mubarak (NIS: KAF-2024-001, Kelas: Umar bin Khattab, Halaqah: Halaqah Abu Bakar, Angkatan 2024); Fatimah Az-Zahra (NIS: KAF-2024-002); Muhammad Ihsan (NIS: KAF-2024-003); Aisyah Nur Hamidah (NIS: KAF-2024-004).
  - **Guru**: Ustadz Rizki Firmansyah (pembina Halaqah Abu Bakar, mapel Tahfidz & Adab); Ustadzah Sari Amelia (pembina Halaqah Umar, mapel Calistung); Ustadz Hilmi Rahman (mapel Berhitung).
  - **Manajemen**: Ustadz Dr. Hendra Wijaya (Direktur Pendidikan); Ustadzah Ratna Kusuma (Kepala Kuttab).
  - **Kelas**: Umar bin Khattab (A), Abu Bakar (B), Usman Affan (C).
  - **Halaqah**: Halaqah Abu Bakar, Halaqah Umar, Halaqah Ali.
  - **Mapel**: Tahfidz Qur'an, Adab & Akhlak, Calistung, Berhitung, Fiqih Ibadah.
  - **Catatan Perilaku**: _"Ahmad Zaki menunjukkan sikap kepemimpinan saat memimpin doa sebelum belajar."_ (positif); _"Muhammad Ihsan tidak mengerjakan tugas murojaah selama 3 hari berturut-turut."_ (pelanggaran ringan).
  - **Setoran Hafalan**: _"Ziyadah: Surah An-Naba ayat 1-15, Juz 30, Nilai: A, Catatan: Bacaan lancar, tajwid perlu perbaikan pada mad."_
  - **Kasus Khusus**: _"Aisyah Nur Hamidah — kasus: sakit berkepanjangan 2 pekan, tindakan: koordinasi dengan wali, status: In-Progress."_
  - **Tahun Ajaran**: "2024/2025 - Semester Ganjil".

---

## 10. Fondasi Teknis (Untuk Tim Pengembang / Programmer & AI)
*Petunjuk arsitektur teknis spesifik.*
- **Bahasa & Framework**: Next.js 15 (App Router, Server Actions, Server Components), TypeScript strict mode.
- **Tampilan Antarmuka (UI)**: Tailwind CSS v4, shadcn/ui Component Library, Lucide Icons, Recharts (untuk analitik), TanStack Table (untuk tabel), react-hook-form + Zod resolver.
- **Autentikasi**: Clerk Authentication (email/password, akun dibuat oleh Admin via Clerk Admin API, role disimpan sebagai `publicMetadata.role` + tabel `users`).
- **Basis Data (Database)**: Neon PostgreSQL (serverless) dengan Drizzle ORM + Drizzle Kit untuk migrasi.
- **Storage & CDN**: Bunny CDN (aset statis) & Bunny Stream (siap untuk modul video berikutnya).
- **Deployment**: Vercel (cron job via Vercel Cron untuk reminder mingguan).
- **Notification**: In-app notification (tabel `notifications`), real-time via polling 30 detik di header (bisa di-upgrade ke WebSocket nanti).

### Struktur Skema Database Nyata
```typescript
// db/schema.ts
import { pgTable, text, uuid, timestamp, integer, boolean, date, jsonb, pgEnum, uniqueIndex, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ===== ENUMS =====
export const roleEnum = pgEnum("role", ["admin", "guru", "manajemen"]);
export const userStatusEnum = pgEnum("user_status", ["active", "inactive"]);
export const genderEnum = pgEnum("gender", ["L", "P"]);
export const studentStatusEnum = pgEnum("student_status", ["aktif", "lulus", "pindah", "berhenti"]);
export const attendanceStatusEnum = pgEnum("attendance_status", ["hadir", "terlambat", "sakit", "izin", "alpha"]);
export const memorizationTypeEnum = pgEnum("memorization_type", ["ziyadah", "murojaah"]);
export const qualityEnum = pgEnum("quality", ["A", "B", "C", "D"]);
export const behaviorTypeEnum = pgEnum("behavior_type", ["positif", "pelanggaran"]);
export const severityEnum = pgEnum("severity", ["ringan", "sedang", "berat"]);
export const progressLevelEnum = pgEnum("progress_level", ["belum", "sedang_berkembang", "berkembang", "mahir"]);
export const caseStatusEnum = pgEnum("case_status", ["open", "in_progress", "resolved"]);

// ===== USERS & AUTH =====
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: roleEnum("role").notNull(),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  status: userStatusEnum("status").notNull().default("active"),
  mustChangePassword: boolean("must_change_password").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  emailIdx: uniqueIndex("users_email_idx").on(t.email),
}));

// ===== MASTER DATA =====
export const academicYears = pgTable("academic_years", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),               // "2024/2025"
  semester: text("semester").notNull(),        // "ganjil" | "genap"
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const classes = pgTable("classes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),                // "Umar bin Khattab"
  code: text("code").notNull().unique(),       // "KAF-A"
  level: text("level").notNull(),              // "A", "B", "C"
  academicYearId: uuid("academic_year_id").notNull().references(() => academicYears.id, { onDelete: "restrict" }),
  homeroomTeacherId: uuid("homeroom_teacher_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const halaqahs = pgTable("halaqahs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),                // "Halaqah Abu Bakar"
  classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const subjects = pgTable("subjects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),                // "Tahfidz Qur'an"
  category: text("category").notNull(),        // "tahfidz" | "adab" | "calistung" | "berhitung" | "fiqih"
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ===== STUDENTS =====
export const students = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),
  nis: text("nis").notNull().unique(),         // "KAF-2024-001"
  fullName: text("full_name").notNull(),
  gender: genderEnum("gender").notNull(),
  birthDate: date("birth_date").notNull(),
  birthPlace: text("birth_place"),
  address: text("address"),
  className: text("class_name"),
  classId: uuid("class_id").references(() => classes.id, { onDelete: "set null" }),
  halaqahId: uuid("halaqah_id").references(() => halaqahs.id, { onDelete: "set null" }),
  academicYearId: uuid("academic_year_id").references(() => academicYears.id, { onDelete: "set null" }),
  enrollmentDate: date("enrollment_date").notNull(),
  fatherName: text("father_name"),
  motherName: text("mother_name"),
  guardianName: text("guardian_name"),
  guardianPhone: text("guardian_phone"),
  photoUrl: text("photo_url"),
  status: studentStatusEnum("status").notNull().default("aktif"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  classIdx: index("students_class_idx").on(t.classId),
  halaqahIdx: index("students_halaqah_idx").on(t.halaqahId),
}));

// ===== ATTENDANCE =====
export const attendance = pgTable("attendance", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  halaqahId: uuid("halaqah_id").notNull().references(() => halaqahs.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  date: date("date").notNull(),
  status: attendanceStatusEnum("status").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uniquePerDay: uniqueIndex("attendance_student_date_idx").on(t.studentId, t.date),
  dateIdx: index("attendance_date_idx").on(t.date),
}));

// ===== QURAN MEMORIZATION =====
export const quranMemorization = pgTable("quran_memorization", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  date: date("date").notNull(),
  type: memorizationTypeEnum("type").notNull(),
  surahName: text("surah_name").notNull(),
  surahNumber: integer("surah_number").notNull(),
  ayahStart: integer("ayah_start").notNull(),
  ayahEnd: integer("ayah_end").notNull(),
  juz: integer("juz"),
  quality: qualityEnum("quality").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  studentIdx: index("quran_student_idx").on(t.studentId),
  dateIdx: index("quran_date_idx").on(t.date),
}));

// ===== ADAB & SIKAP =====
export const adabAssessment = pgTable("adab_assessment", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  date: date("date").notNull(),
  period: text("period").notNull(),             // "2024/2025-ganjil" atau "pekan-12"
  scoreHonesty: integer("score_honesty").notNull(),     // 1-4
  scoreIndependence: integer("score_independence").notNull(),
  scoreSocial: integer("score_social").notNull(),
  scoreCleanliness: integer("score_cleanliness").notNull(),
  scoreDiscipline: integer("score_discipline").notNull(),
  averageScore: integer("average_score").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ===== BEHAVIOR LOG =====
export const behaviorLog = pgTable("behavior_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  date: date("date").notNull(),
  type: behaviorTypeEnum("type").notNull(),
  category: text("category").notNull(),          // "kedisiplinan" | "akhlak" | "kebersihan" | ...
  severity: severityEnum("severity"),
  description: text("description").notNull(),
  actionTaken: text("action_taken"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  studentIdx: index("behavior_student_idx").on(t.studentId),
  severityIdx: index("behavior_severity_idx").on(t.severity),
}));

// ===== PROGRESS (BERHITUNG & CALISTUNG) =====
export const progressRecords = pgTable("progress_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  subjectCategory: text("subject_category").notNull(),   // "berhitung" | "calistung"
  aspectName: text("aspect_name").notNull(),             // "penjumlahan", "membaca lancar"
  period: text("period").notNull(),                       // "2024/2025-ganjil"
  level: progressLevelEnum("level").notNull(),
  score: integer("score"),                                // 0-100 optional
  note: text("note"),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uniqPerPeriod: uniqueIndex("progress_unique_idx").on(t.studentId, t.subjectCategory, t.aspectName, t.period),
  studentIdx: index("progress_student_idx").on(t.studentId),
}));

// ===== JURNAL MENGAJAR =====
export const teachingJournals = pgTable("teaching_journals", {
  id: uuid("id").primaryKey().defaultRandom(),
  teacherId: uuid("teacher_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  halaqahId: uuid("halaqah_id").notNull().references(() => halaqahs.id, { onDelete: "cascade" }),
  subjectId: uuid("subject_id").references(() => subjects.id, { onDelete: "set null" }),
  date: date("date").notNull(),
  topic: text("topic").notNull(),
  method: text("method"),
  summary: text("summary").notNull(),
  obstacles: text("obstacles"),
  reflection: text("reflection"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  dateIdx: index("journal_date_idx").on(t.date),
}));

// ===== KASUS KHUSUS =====
export const specialCases = pgTable("special_cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  reporterId: uuid("reporter_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),          // "kesehatan" | "keluarga" | "akademik" | "perilaku"
  status: caseStatusEnum("status").notNull().default("open"),
  followUpNotes: jsonb("follow_up_notes").$type<Array<{ by: string; at: string; note: string }>>().default([]),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  studentIdx: index("cases_student_idx").on(t.studentId),
  statusIdx: index("cases_status_idx").on(t.status),
}));

// ===== REMINDER SETTINGS =====
export const reminderSettings = pgTable("reminder_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  dayOfWeek: integer("day_of_week").notNull(),       // 0=Sunday..6=Saturday
  timeOfDay: text("time_of_day").notNull(),           // "14:00"
  timezone: text("timezone").notNull().default("Asia/Jakarta"),
  isActive: boolean("is_active").notNull().default(true),
  messageTemplate: text("message_template").notNull().default("Assalamu'alaikum Ustadz/Ustadzah, mohon lengkapi input perkembangan santri pekan ini."),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ===== NOTIFICATIONS =====
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),          // "reminder_weekly" | "attendance_alpha" | "case_new" | "behavior_heavy" | "system"
  title: text("title").notNull(),
  message: text("message").notNull(),
  linkUrl: text("link_url"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  userIdx: index("notif_user_idx").on(t.userId, t.isRead),
}));

// ===== ACTIVITY LOG =====
export const activityLog = pgTable("activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),          // "create" | "update" | "delete"
  entity: text("entity").notNull(),           // "student" | "attendance" | ...
  entityId: text("entity_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  entityIdx: index("activity_entity_idx").on(t.entity, t.entityId),
}));

// ===== RELATIONS =====
export const usersRelations = relations(users, ({ many }) => ({
  halaqahsAsTeacher: many(halaqahs),
  journals: many(teachingJournals),
  notifications: many(notifications),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  class: one(classes, { fields: [students.classId], references: [classes.id] }),
  halaqah: one(halaqahs, { fields: [students.halaqahId], references: [halaqahs.id] }),
  attendances: many(attendance),
  memorizations: many(quranMemorization),
  behaviors: many(behaviorLog),
  adabRecords: many(adabAssessment),
  progressRecords: many(progressRecords),
  cases: many(specialCases),
}));

export const halaqahsRelations = relations(halaqahs, ({ one, many }) => ({
  class: one(classes, { fields: [halaqahs.classId], references: [classes.id] }),
  teacher: one(users, { fields: [halaqahs.teacherId], references: [users.id] }),
  students: many(students),
}));
```

### Variabel Lingkungan (`.env.example`)
```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Neon PostgreSQL (Drizzle ORM)
DATABASE_URL=postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/simas?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/simas?sslmode=require

# Bunny CDN (Static Assets)
BUNNY_STORAGE_ZONE=simas-assets
BUNNY_STORAGE_API_KEY=xxxxxxxxxxxxxxxxxxxx
BUNNY_CDN_URL=https://simas.b-cdn.net

# Bunny Stream (untuk modul video mendatang)
BUNNY_STREAM_LIBRARY_ID=123456
BUNNY_STREAM_API_KEY=xxxxxxxxxxxxxxxxxxxx

# Cron Job Secret (untuk Vercel Cron reminder mingguan)
CRON_SECRET=super-secret-random-string-xxxxxx

# Admin Default (untuk seed awal)
ADMIN_DEFAULT_EMAIL=admin@kuttabal-fatih.sch.id
ADMIN_DEFAULT_PASSWORD=ChangeMe123!
```

---

## 11. Tahapan Pengerjaan & Task Breakdown (Actionable Work Breakdown Structure)
*Daftar tugas terstruktur dan terurut (Atomic Tasks) yang dirancang agar AI Coding Assistant dapat menyelesaikan satu Fase penuh secara mandiri, lalu berhenti dan menunggu konfirmasi pengguna sebelum melanjutkan ke Fase berikutnya.*

### Tahap 1: Fondasi Proyek, UI/UX, & Semua Halaman Frontend (Dummy Data)
*Tujuan: Membangun seluruh antarmuka visual secara 100% lengkap dan responsif menggunakan data dummy sebelum menyentuh database. Semua halaman di Bab 3 WAJIB dibuat penuh, tidak ada placeholder.*

- [ ] **Task 1.1 (Foundations & Design System)**: Inisialisasi Next.js 15 App Router + TypeScript strict + Tailwind CSS v4. Setup CSS variable token warna korporat (Primary Emerald Deep, Secondary Slate Navy, Accent Amber Gold). Konfigurasi font 'Plus Jakarta Sans' (heading), 'Inter' (body), 'JetBrains Mono' (angka). Install shadcn/ui (Button, Card, Input, Label, Dialog, Table, Badge, Dropdown Menu, Tabs, Select, Textarea, Toast/Sonner, Skeleton, Avatar, Sheet, Calendar, Popover, AlertDialog, Form). Install Lucide Icons, Recharts, TanStack Table, react-hook-form + Zod, date-fns.
- [ ] **Task 1.2 (Layouts & Persistent Navigation)**: Buat `app/(public)/layout.tsx` (Header publik + Footer), `app/(dashboard)/layout.tsx` (Sidebar kiri fixed + Header kecil dengan breadcrumb, search, icon bell, dropdown profil), dan `app/(auth)/layout.tsx` untuk halaman login. Buat komponen `<RoleBasedSidebar />` yang merender menu berdasarkan role dummy. Implement responsive mobile drawer (Sheet shadcn).
- [ ] **Task 1.3 (Public Pages)**: Buat halaman lengkap: `/` (Landing Page — hero, keunggulan, CTA ke `/login`), `/login` (form dummy dengan tombol role simulation untuk testing: Admin/Guru/Manajemen), `/lupa-password`, `/akses-ditolak` (403). Semua halaman dengan UI penuh, bukan placeholder.
- [ ] **Task 1.4 (Admin Area Pages - Dummy)**: Buat halaman penuh dengan mock data TypeScript: `/admin/dashboard` (kartu statistik: total santri/guru/kelas, aktivitas terbaru), `/admin/users` (tabel CRUD dummy dengan filter role & search), `/admin/users/tambah` (form lengkap), `/admin/santri` (tabel CRUD dummy dengan filter kelas/halaqah/status + search), `/admin/santri/:id` (form edit identitas), `/admin/master/kelas`, `/admin/master/halaqah`, `/admin/master/mapel`, `/admin/master/tahun-ajaran` (semua CRUD dummy dengan tabel + modal form), `/admin/pengaturan/reminder` (form konfigurasi hari/jam + toggle aktif), `/admin/notifikasi` (log notifikasi dummy), `/admin/profil`.
- [ ] **Task 1.5 (Guru Area Pages - Dummy)**: Buat halaman penuh dengan mock data: `/guru/dashboard` (ringkasan halaqah, santri, notifikasi reminder, progress input), `/guru/absensi` (form tanggal + halaqah + 8 santri dummy dengan toggle status), `/guru/hafalan` (form setoran dengan dropdown surah/ayat + tabel riwayat), `/guru/adab` (form grid penilaian 5 indikator per santri), `/guru/perilaku` (form catatan + tabel riwayat dengan badge severity), `/guru/perkembangan` (form berhitung & calistung per periode), `/guru/jurnal` (form jurnal + kartu riwayat), `/guru/kasus` (form kasus + tabel dengan status badge), `/guru/santri` (daftar santri halaqah), `/guru/santri/:id` (rekam jejak santri read-only), `/guru/profil`.
- [ ] **Task 1.6 (Manajemen Area Pages - Dummy)**: Buat halaman penuh dengan mock data: `/manajemen/dashboard` (statistik global + grafik distribusi + ringkasan kasus), `/manajemen/santri` (Buku Induk dengan TanStack Table: sortable, filter kelas/halaqah/angkatan/status, search, pagination), `/manajemen/santri/:id` (**HALAMAN UTAMA** — Rekam Jejak 360° Santri dengan 9 tab: Identitas, Absensi, Hafalan, Berhitung, Calistung, Adab & Akhlak, Perilaku, Kasus, Jurnal — semua tab terisi konten dummy kaya), `/manajemen/analitik` (Recharts: bar chart tren hafalan, pie chart distribusi adab, line chart kehadiran), `/manajemen/guru` (tabel kinerja guru), `/manajemen/kasus` (tabel lintas kelas dengan filter status), `/manajemen/laporan` (form generate laporan + preview), `/manajemen/notifikasi`, `/manajemen/profil`.
- [ ] **Task 1.7 (Shared Pages - Dummy)**: Buat `/notifikasi` (Pusat Notifikasi dengan tab Belum Dibaca/Semua + aksi mark read), komponen `<NotificationBell />` dengan badge unread count dummy di header.
- [ ] **Task 1.8 (Mock Data & TypeScript Types)**: Buat folder `lib/mock/` berisi `students.ts`, `users.ts`, `attendance.ts`, `memorization.ts`, `behavior.ts`, `cases.ts`, `notifications.ts`, `classes.ts`, `halaqahs.ts`, `subjects.ts` — semua dengan data dummy berbahasa Indonesia sesuai Bab 9. Definisikan tipe TypeScript di `lib/types/` sesuai skema Bab 10.
- [ ] **Task 1.9 (Polish & QA Frontend)**: Cek responsivitas seluruh halaman di breakpoint mobile/tablet/desktop. Perbaiki spacing, alignment tabel, dan warna badge. Implement loading skeleton untuk semua tabel & chart. Pastikan seluruh navigasi antar halaman berjalan lancar tanpa error.

### Tahap 2: Database, Autentikasi, & Integrasi Data Dinamis
*Tujuan: Menghidupkan aplikasi dengan database Neon PostgreSQL, Clerk Auth, dan Server Actions pengganti data dummy.*

- [ ] **Task 2.1 (Database Schema & Migrations)**: Buat `db/schema.ts` lengkap sesuai Bab 10 (semua tabel: `users`, `academic_years`, `classes`, `halaqahs`, `subjects`, `students`, `attendance`, `quran_memorization`, `adab_assessment`, `behavior_log`, `progress_records`, `teaching_journals`, `special_cases`, `reminder_settings`, `notifications`, `activity_log`). Konfigurasi `drizzle.config.ts`. Jalankan `drizzle-kit generate` + `drizzle-kit migrate` ke Neon. Buat `db/seed.ts` untuk seed admin default + master data + 10 santri + 3 guru + 2 manajemen.
- [ ] **Task 2.2 (Authentication & Route Middleware)**: Pasang Clerk Provider di root layout. Setup `middleware.ts` untuk memproteksi `/admin/*`, `/guru/*`, `/manajemen/*` dengan validasi role dari `publicMetadata`. Buat Clerk Webhook handler `app/api/webhooks/clerk/route.ts` untuk sinkronisasi user ke tabel `users`. Buat Server Action `createUser` (via Clerk Admin API) + `deactivateUser`. Buat logika force-change-password saat login pertama.
- [ ] **Task 2.3 (Server Actions - Master Data)**: Buat Server Actions lengkap dengan Zod validation: `createClass`/`updateClass`/`deleteClass`, `createHalaqah`/`updateHalaqah`/`deleteHalaqah`, `createSubject`/`updateSubject`/`deleteSubject`, `createAcademicYear`/`updateAcademicYear`/`deleteAcademicYear`, `createStudent`/`updateStudent`/`deleteStudent` (semua di `app/actions/master-actions.ts`).
- [ ] **Task 2.4 (Server Actions - Guru Modules)**: Buat Server Actions: `bulkSaveAttendance`, `saveMemorization`, `saveAdabAssessment`, `saveBehaviorLog`, `saveProgressRecord`, `saveTeachingJournal`, `createSpecialCase`/`updateCaseStatus`/`addCaseFollowUp` — semua dengan Zod validation + audit trail ke `activity_log`.
- [ ] **Task 2.5 (Server Actions - Notifikasi & Reminder)**: Buat `sendNotification`, `markNotificationAsRead`/`markAllAsRead`. Buat `updateReminderSettings`. Buat route `app/api/cron/reminder/route.ts` dengan proteksi `CRON_SECRET` sebagai trigger pengiriman reminder mingguan. Konfigurasi `vercel.json` untuk cron schedule.
- [ ] **Task 2.6 (Frontend Data Binding - Admin)**: Ganti seluruh mock data di area Admin dengan query database asli. Halaman `/admin/users`, `/admin/santri`, seluruh `/admin/master/*`, `/admin/pengaturan/reminder`, `/admin/notifikasi` semuanya dinamis + Server Actions terintegrasi (create/update/delete + revalidatePath).
- [ ] **Task 2.7 (Frontend Data Binding - Guru)**: Ganti seluruh mock data di area Guru dengan query database asli. Semua form input (`/guru/absensi`, `/guru/hafalan`, `/guru/adab`, `/guru/perilaku`, `/guru/perkembangan`, `/guru/jurnal`, `/guru/kasus`) tersambung ke Server Actions dengan loading state + toast feedback.
- [ ] **Task 2.8 (Frontend Data Binding - Manajemen)**: Ganti seluruh mock data di area Manajemen. Halaman `/manajemen/santri/:id` (Rekam Jejak 360°) harus memuat 9 tab data dinamis dari database dengan filter periode. Halaman `/manajemen/analitik` menghitung statistik dari SQL aggregate query. Implement caching `unstable_cache` (TTL 300s) untuk query statistik.
- [ ] **Task 2.9 (Notifikasi Bell & Middleware Role)**: Implementasi polling notifikasi unread di header (setInterval 30 detik memanggil `/api/notifications/unread`). Uji seluruh matriks hak akses Bab 5 untuk memastikan Guru tidak bisa akses `/admin/*`, dan Manajemen hanya bisa read-only pada data guru.

### Tahap 3: Integrasi Pihak Ketiga, Keamanan, SEO, & Deployment
*Tujuan: Menyempurnakan integrasi Bunny, optimasi performa, keamanan penuh, dan rilis ke production.*

- [ ] **Task 3.1 (Bunny CDN Integration)**: Aktifkan Bunny CDN untuk aset statis (logo, favicon, ilustrasi). Buat helper `uploadToBunny` untuk upload foto santri dari form. Buat route `/api/upload` dengan proteksi role. Verifikasi semua URL aset dialihkan ke Bunny CDN domain.
- [ ] **Task 3.2 (Non-Functional Requirements & Security)**: Pasang dynamic SEO via Next.js Metadata API di `/`, `/login` (title, description, OG tags). Buat `robots.txt` dan `sitemap.xml`. Implement rate limiting di `/login` dan cron endpoint. Tambahkan sanitasi HTML (DOMPurify) untuk field catatan bebas. Pastikan seluruh Zod schema validasi aktif. Set `X-Frame-Options`, `Content-Security-Policy`, dan security headers via `next.config.ts`.
- [ ] **Task 3.3 (Export Laporan PDF & Excel)**: Buat endpoint `/api/export/student/:id/pdf` menggunakan `@react-pdf/renderer` atau `puppeteer-core` untuk generate rekam jejak santri. Buat `/api/export/class/:id/excel` menggunakan `exceljs`. Hubungkan tombol export di `/manajemen/laporan` dan `/manajemen/santri/:id`.
- [ ] **Task 3.4 (End-to-End Testing & Bugfix)**: Uji seluruh user journey: (1) Admin membuat akun Guru → (2) Guru login → (3) Guru input absensi & hafalan → (4) Manajemen melihat rekam jejak → (5) Manajemen export PDF → (6) Cron reminder terkirim ke Guru. Perbaiki semua error, responsive glitch, N+1 query, dan optimasi indeks database.
- [ ] **Task 3.5 (Production Build & Deployment)**: Konfigurasi `.env.production` lengkap. Verifikasi `pnpm build` sukses tanpa error TypeScript maupun ESLint. Deploy ke Vercel dengan domain production. Setup Vercel Cron untuk reminder mingguan. Verifikasi Clerk production keys aktif. Uji smoke test pasca-deploy untuk seluruh role.

---

## 12. Master Starter Prompt (Siap Coding untuk AI Agent)
*Salin prompt di bawah ini ke AI Coding Assistant (Google Antigravity / Cursor / Claude Code / GitHub Copilot / Roo Code / dll.) untuk memulai pengerjaan:*
```markdown
Halo! Kamu berperan sebagai Senior Fullstack Architect dan Lead Developer.

Saya ingin membangun aplikasi "Sistem Informasi Manajemen Santri (SiMas)" untuk Kuttab Al-Fatih Bandung berdasarkan dokumen PRD ini.

Silakan baca file @PRD.md secara menyeluruh terlebih dahulu.

ATURAN EKSEKUSI (WAJIB DIPATUHI):
1. JANGAN PERNAH membuat seluruh sistem sekaligus. Kerjakan proyek ini secara BERTAHAP PER FASE sesuai Bab 11.
2. Setiap Fase harus diselesaikan 100% secara mandiri dalam satu putaran kerja sebelum melapor. Contoh: selesaikan seluruh Tahap 1 (Task 1.1 s/d 1.9) — membangun fondasi, design system, seluruh halaman publik, Admin, Guru, dan Manajemen dengan DUMMY DATA lengkap — lalu BERHENTI.
3. Setelah menyelesaikan satu Fase penuh, WAJIB berhenti, laporkan ringkasan hasil kerja (file yang dibuat, halaman yang selesai, cara menjalankan), lalu TUNGGU izin konfirmasi saya sebelum memulai Fase berikutnya.
4. DILARANG KERAS membuat "Halaman Placeholder" atau "Under Construction". Semua halaman yang disebut di Bab 3 wajib dibuat lengkap dengan UI/UX penuh dan data dummy realistis berbahasa Indonesia sesuai Bab 9 (contoh: Ahmad Zaki Mubarak, Ustadz Rizki Firmansyah, Halaqah Abu Bakar, Kelas Umar bin Khattab).
5. Patuhi Tech Stack secara STRICT: Next.js 15 App Router, Clerk Auth, Neon PostgreSQL + Drizzle ORM, Bunny CDN, Tailwind CSS v4, shadcn/ui.
6. Patuhi Design System Bab 4: warna korporat (Primary Emerald Deep HSL(158, 64%, 26%), Secondary Slate Navy, Accent Amber Gold), font 'Plus Jakarta Sans' + 'Inter' + 'JetBrains Mono', rounded-lg/xl, shadow-sm/md/lg, vibe korporat formal.
7. Patuhi skema database Bab 10 secara persis (nama tabel, kolom, enum, relasi) — jangan improvisasi skema baru tanpa persetujuan saya.
8. Buat struktur folder yang rapi: `app/(public)`, `app/(auth)`, `app/(dashboard)/admin`, `app/(dashboard)/guru`, `app/(dashboard)/manajemen`, `components/`, `lib/`, `db/`. Gunakan TypeScript strict mode.

MULAI DARI MANA:
- Mulai dari **TAHAP 1: Fondasi Proyek, UI/UX, & Semua Halaman Frontend (Dummy Data)** — mulai dari Task 1.1 (Foundations & Design System).
- Selesaikan seluruh Task 1.1 s/d 1.9 sampai semua halaman di Bab 3 (Public: `/`, `/login`, `/lupa-password`; Admin: 12 halaman; Guru: 12 halaman; Manajemen: 10 halaman; Shared: `/notifikasi`, `/akses-ditolak`) selesai dengan UI penuh, dummy data lengkap, dan responsif.
- Setelah Tahap 1 selesai 100%, BERHENTI dan laporkan hasilnya.

Jika kamu sudah membaca dan memahami PRD ini, silakan berikan:
1. Ringkasan singkat pemahamanmu tentang SiMas, tech stack, dan design system.
2. Konfirmasi rencana eksekusi Tahap 1 (daftar file utama yang akan kamu buat).
3. Tanyakan kesiapan saya untuk mulai dari Task 1.1.

Lalu tunggu konfirmasi saya sebelum eksekusi dimulai!
```
