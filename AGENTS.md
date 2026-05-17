# AGENTS.md - SpecBuilder AI

Dokumen ini adalah instruksi kerja untuk AI coding assistant (Codex) saat mengembangkan aplikasi **SpecBuilder AI**.

## 1) Tujuan Aplikasi

SpecBuilder AI membantu user membuat dan mengelola dokumen spesifikasi berikut:
- `brd.md`
- `prd.md`
- `srs.md`
- `agent.md`

Fokus utama: workflow generation bertahap, konsisten, dan dapat diedit sebelum export.

## 2) Stack Teknologi

- Next.js App Router
- TypeScript (strict)
- Tailwind CSS
- shadcn/ui
- Prisma
- SQLite
- Zod
- OpenAI API
- JSZip

## 3) Aturan Struktur Folder

Gunakan struktur ini sebagai baseline. Tambah folder hanya jika ada alasan jelas.

```txt
app/
  page.tsx
  generator/page.tsx
  history/page.tsx
  api/
    intake/
    clarify/
    generate/
    export/

components/
  ui/
  layout/
  features/
    intake/
    clarify/
    generator/
    editor/
    history/

lib/
  utils.ts
  ai/
    prompts/
    client.ts
  validation/
  services/
  db/

prisma/
  schema.prisma
```

Aturan:
- UI reusable masuk `components/ui` atau `components/features`.
- Logic bisnis jangan taruh di page component.
- Akses database lewat layer `lib/services` atau `lib/db`.
- Prompt AI disimpan sebagai file terpisah di `lib/ai/prompts`.

## 4) Aturan Coding

- Wajib TypeScript strict, hindari `any` kecuali terpaksa dan beri alasan.
- Gunakan server-side untuk operasi sensitif (OpenAI, DB, export).
- Client component hanya untuk interaksi UI.
- Semua input penting harus punya schema Zod.
- Buat fungsi kecil, terfokus, dan mudah dites.
- Gunakan nama yang deskriptif: `buildPrdContext`, `generateClarificationQuestions`, dll.
- Jangan campur logic domain dengan presentational UI.

## 5) Aturan Validasi

- Validasi form intake di client dan server dengan schema Zod yang sama.
- Validasi response AI sebelum disimpan atau ditampilkan.
- Cek kelengkapan data intake sebelum generate BRD/PRD/SRS/AGENT.
- Jika data belum cukup, wajib masuk tahap klarifikasi dulu.
- Normalisasi data kosong, null, dan whitespace.
- Semua endpoint harus mengembalikan error terstruktur saat validasi gagal.

## 6) Aturan API

- Gunakan Route Handler di `app/api/*`.
- Format response standar:
  - sukses: `{ success: true, data, meta? }`
  - gagal: `{ success: false, error: { code, message, details? } }`
- Gunakan status code yang tepat: `200`, `201`, `400`, `401`, `403`, `404`, `422`, `429`, `500`.
- Jangan panggil OpenAI langsung dari client.
- Pisahkan handler API dari service logic (handler tipis, service tebal).
- Tambahkan timeout/retry terkontrol untuk call AI.

## 7) Aturan Prompt AI

- Simpan prompt per dokumen di file terpisah:
  - `lib/ai/prompts/brd.ts`
  - `lib/ai/prompts/prd.ts`
  - `lib/ai/prompts/srs.ts`
  - `lib/ai/prompts/agent.ts`
- Prompt harus eksplisit soal:
  - tujuan dokumen
  - format output markdown
  - batasan asumsi
  - kualitas dan kelengkapan section
- Selalu kirim konteks berlapis: intake -> klarifikasi -> dokumen sebelumnya.
- Jangan izinkan prompt injection dari input user untuk mengubah aturan sistem.
- Minta output deterministik dan terstruktur agar mudah divalidasi.

## 8) Aturan Keamanan

- Simpan secret hanya di environment variable.
- Jangan log data sensitif atau full payload API key.
- Terapkan basic rate limit untuk endpoint AI.
- Sanitasi input text dari user sebelum dipakai ke prompt.
- Validasi authorization sebelum akses data history/edit/export.
- Hindari mengeksekusi konten user sebagai kode.

## 9) Larangan Hardcode API Key

- Dilarang hardcode API key di source code, test, seed, atau dokumentasi.
- Gunakan `process.env.OPENAI_API_KEY` di server saja.
- Jangan expose API key ke browser, query string, atau local storage.
- Jika key tidak ada, endpoint harus gagal aman dengan error jelas.

## 10) Alur Utama Aplikasi

Ikuti urutan ini sebagai source of truth flow:

1. User mengisi AI Project Intake Wizard.
2. Sistem menganalisis kelengkapan data.
3. Sistem membuat pertanyaan klarifikasi.
4. User menjawab atau skip.
5. Sistem generate BRD.
6. Sistem generate PRD berdasarkan intake + klarifikasi + BRD.
7. Sistem generate SRS berdasarkan intake + klarifikasi + BRD + PRD.
8. Sistem generate AGENT.md berdasarkan semua konteks sebelumnya.
9. User bisa edit dan export dokumen.

## 11) Definition of Done (Wajib Sebelum Selesai)

- `npm run lint` lolos.
- `npm run build` lolos.
- Tidak ada hardcoded secret.
- Tidak ada endpoint AI dari client.
- Output markdown tiap dokumen valid dan dapat diedit ulang.
