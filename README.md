# SpecBuilder AI

SpecBuilder AI adalah aplikasi web untuk menyusun spesifikasi proyek berbasis AI secara bertahap dari intake hingga dokumen siap edit dan export.

## Deskripsi

Aplikasi ini membantu tim produk dan engineering membuat dokumen berikut secara terstruktur:
- `brd.md`
- `prd.md`
- `srs.md`
- `agent.md`

Proses dibuat bertahap agar konteks tidak hilang:
1. User mengisi **AI Project Intake Wizard**.
2. Sistem menganalisis kelengkapan intake dan membuat pertanyaan klarifikasi.
3. User menjawab (atau skip) klarifikasi.
4. Sistem generate dokumen berurutan: **BRD -> PRD -> SRS -> AGENT.md**.
5. User dapat mengedit semua dokumen dan export file markdown/zip.

## Fitur Utama

- Intake wizard multi-step dengan validasi field wajib.
- Analisis intake untuk menghasilkan pertanyaan klarifikasi (maksimal 10).
- Alur generation dokumen berurutan dengan konteks dokumen sebelumnya.
- Anti-halusinasi prompt guardrails (tidak boleh mengarang data penting).
- Editor + preview markdown per dokumen (state tetap saat pindah tab).
- Export per file (`brd.md`, `prd.md`, `srs.md`, `agent.md`) atau ZIP (`specbuilder-docs.zip`).
- Riwayat project tersimpan di SQLite via Prisma.
- Update dokumen hasil edit dari halaman history.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui (komponen dasar UI)
- Prisma
- SQLite
- Zod
- OpenAI API
- JSZip

## Struktur Folder

```txt
app/
  api/
    analyze-intake/route.ts
    generate/route.ts
    projects/route.ts
    projects/[id]/route.ts
  generator/page.tsx
  history/page.tsx
  layout.tsx
  page.tsx

components/
  documents/
  history/
  intake/
  ui/

lib/
  export/
  generators/
  prompts/
  validators/
  openai.ts
  prisma.ts
  utils.ts

prisma/
  migrations/
  schema.prisma
```

## Setup Environment

1. Copy file contoh environment:

```bash
cp .env.example .env
```

Untuk Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

2. Isi `.env`:

```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="your-openai-api-key"
OPENAI_MODEL="gpt-5.2"
OPENAI_TIMEOUT_MS="45000"
OPENAI_MAX_RETRIES="2"
AI_ANALYZE_RATE_LIMIT="12"
AI_ANALYZE_RATE_LIMIT_WINDOW_MS="60000"
AI_GENERATE_RATE_LIMIT="6"
AI_GENERATE_RATE_LIMIT_WINDOW_MS="60000"
```

Catatan:
- Jangan hardcode API key di source code.
- Jangan commit `.env` ke repository.

## Install Dependency

```bash
npm install
```

## Migrate Database

Generate Prisma Client + jalankan migration:

```bash
npm run prisma:generate
npm run prisma:migrate:dev
```

## Menjalankan Development Server

```bash
npm run dev
```

Akses aplikasi:
- Landing: [http://localhost:3000](http://localhost:3000)
- Generator: [http://localhost:3000/generator](http://localhost:3000/generator)
- History: [http://localhost:3000/history](http://localhost:3000/history)

## Cara Menggunakan Aplikasi

1. Buka halaman `/generator`.
2. Isi semua field wajib intake wizard.
3. Klik **Analyze Intake**.
4. Review pertanyaan klarifikasi.
5. Jawab pertanyaan penting atau skip jika diperlukan.
6. Klik **Generate Documents**.
7. Edit isi BRD/PRD/SRS/AGENT langsung di tab editor.
8. Export per file markdown atau ZIP.
9. Buka halaman `/history` untuk membuka project lama dan update dokumen.

## Cara Kerja AI Project Intake

1. Intake divalidasi menggunakan `intakeSchema` (Zod).
2. API `/api/analyze-intake` memanggil prompt analisis intake.
3. AI mengembalikan:
   - `completenessScore`
   - `missingAreas`
   - `questions[]`
4. Jika respon AI bukan JSON valid, sistem menggunakan fallback logic server.
5. Untuk generation, API `/api/generate` memproses dokumen secara berurutan:
   - BRD dari intake + klarifikasi
   - PRD dari intake + klarifikasi + BRD
   - SRS dari intake + klarifikasi + BRD + PRD
   - AGENT dari intake + klarifikasi + BRD + PRD + SRS
6. Output markdown dibersihkan melalui helper sanitasi agar tidak ada JSON mentah pada output akhir.

## Cara Export Dokumen

Di panel documents:
- **Download brd.md**
- **Download prd.md**
- **Download srs.md**
- **Download agent.md**
- **Download specbuilder-docs.zip**

ZIP dibuat menggunakan JSZip dari state edit terakhir user.

## API Routes

- `POST /api/analyze-intake`
- `POST /api/generate`
- `GET /api/projects`
- `GET /api/projects/[id]`
- `PUT /api/projects/[id]`

Format response:
- sukses: `{ success: true, data, meta? }`
- gagal: `{ success: false, error: { code, message, details? } }`

## Troubleshooting

### 1) `OPENAI_API_KEY is not set`
- Pastikan `.env` ada dan berisi `OPENAI_API_KEY`.
- Restart dev server setelah update `.env`.

### 2) Prisma migration gagal
- Pastikan `DATABASE_URL` valid.
- Jalankan ulang:

```bash
npm run prisma:generate
npm run prisma:migrate:dev
```

### 3) Build error / TypeScript error
- Jalankan:

```bash
npm run lint
npm run build
npx tsc --noEmit
```

### 4) Generate dokumen gagal
- Cek API key OpenAI dan koneksi jaringan server.
- Cek payload intake wajib sudah terisi.
- Lihat respons error dari API `/api/generate`.

### 5) Output AI berisi format tidak sesuai
- Sistem sudah memiliki fallback parsing dan markdown sanitizer.
- Jika masih terjadi, ulangi generate dengan intake/clarification lebih spesifik.

## Script Penting

- `npm run dev` - jalankan server development
- `npm run build` - build production
- `npm run start` - jalankan production server
- `npm run lint` - cek lint
- `npm run prisma:generate` - generate Prisma client
- `npm run prisma:migrate:dev` - migrate database (development)
- `npm run prisma:migrate:deploy` - migrate database (deployment)

## Catatan Keamanan

- Jangan pernah hardcode API key di code.
- Gunakan environment variable untuk secret (`OPENAI_API_KEY`).
- Review output AI sebelum dipakai untuk keputusan bisnis/teknis/legal/compliance.
