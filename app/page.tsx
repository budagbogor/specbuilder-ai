import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock4,
  Code2,
  FileStack,
  Layers3,
  Shield,
  Sparkles,
  WandSparkles,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const highlights = [
  {
    title: "Intake Wizard",
    description:
      "Form multi-step yang terstruktur mengumpulkan semua konteks project — mulai dari business context, product scope, hingga AI agent rules.",
    icon: WandSparkles,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    title: "AI Clarification",
    description:
      "AI menganalisis kelengkapan data intake dan menyusun pertanyaan klarifikasi cerdas untuk menyempurnakan spesifikasi.",
    icon: Sparkles,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    title: "4 Docs Generation",
    description:
      "Generate BRD, PRD, SRS, dan AGENT.md secara berurutan dengan konteks berlapis — setiap dokumen memperkaya dokumen berikutnya.",
    icon: FileStack,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Live Editor",
    description:
      "Edit langsung di browser dengan editor markdown dan preview real-time. Sempurnakan sebelum export.",
    icon: Code2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Export & Download",
    description:
      "Download per-file atau semua dokumen sekaligus dalam satu ZIP. Siap didistribusikan ke tim.",
    icon: Layers3,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    title: "Project History",
    description:
      "Semua project tersimpan di database. Buka kembali, edit ulang, dan simpan kapan saja.",
    icon: Clock4,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
];

const techBadges = [
  "Next.js 16",
  "TypeScript",
  "Tailwind CSS",
  "shadcn/ui",
  "Prisma",
  "SQLite",
  "Zod",
  "OpenAI API",
  "JSZip",
];

const workflowSteps = [
  {
    step: "01",
    title: "Isi Intake Wizard",
    description:
      "Masukkan semua informasi proyek melalui 6 section terstruktur — dari basic info hingga AI agent rules.",
  },
  {
    step: "02",
    title: "Review & Analyze",
    description:
      "AI menganalisis kelengkapan data dan memberikan pertanyaan klarifikasi untuk menutup gap informasi.",
  },
  {
    step: "03",
    title: "Jawab Klarifikasi",
    description:
      "Jawab pertanyaan penting untuk memperkaya konteks, atau skip jika data sudah cukup.",
  },
  {
    step: "04",
    title: "Generate Dokumen",
    description:
      "AI memproses semua konteks dan menghasilkan BRD → PRD → SRS → AGENT.md secara bertahap.",
  },
  {
    step: "05",
    title: "Edit & Export",
    description:
      "Edit markdown di browser, preview hasilnya, lalu download per-file atau semua sekaligus sebagai ZIP.",
  },
];

export default function Home() {
  return (
    <div className="space-y-12 pb-8 sm:space-y-16">
      {/* ── Hero Section ──────────────────────────────── */}
      <section className="animate-fade-in-up rounded-3xl border border-border/70 bg-card/90 px-6 py-10 shadow-[0_28px_80px_-48px_rgba(28,36,56,0.58)] backdrop-blur sm:px-10 sm:py-14">
        <Badge className="mb-5" variant="secondary">
          <Zap className="mr-1 h-3 w-3" />
          AI-Powered Specification Builder
        </Badge>
        <div className="max-w-3xl space-y-5">
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Bangun spesifikasi produk{" "}
            <span className="gradient-text">lebih cepat</span> dengan AI.
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            SpecBuilder AI membantu Anda membuat{" "}
            <strong>BRD, PRD, SRS, dan AGENT.md</strong> secara otomatis
            melalui workflow bertahap yang konsisten. Dari intake wizard hingga
            export — semua dalam satu alur kerja yang terintegrasi.
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="group w-full sm:w-auto">
            <Link href="/generator">
              Mulai Generator
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link href="/history">
              <BookOpen className="mr-2 h-4 w-4" />
              Lihat History
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────── */}
      <section className="space-y-6">
        <div className="animate-fade-in-up delay-100 space-y-2 text-center">
          <Badge variant="secondary">Fitur Utama</Badge>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Semua yang dibutuhkan untuk spesifikasi produk
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            End-to-end workflow dari pengumpulan data hingga export dokumen final
            yang siap didistribusikan.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item, index) => (
            <Card
              key={item.title}
              className="animate-fade-in-up group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{ animationDelay: `${(index + 1) * 0.08}s` }}
            >
              <CardHeader>
                <div
                  className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl ${item.bg} ${item.color} transition-transform duration-300 group-hover:scale-110`}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription className="leading-relaxed">
                  {item.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Workflow Steps ─────────────────────────────── */}
      <section className="space-y-6">
        <div className="animate-fade-in-up delay-200 space-y-2 text-center">
          <Badge variant="secondary">Alur Kerja</Badge>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            5 langkah menuju dokumen spesifikasi lengkap
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          {workflowSteps.map((item, index) => (
            <div
              key={item.step}
              className="animate-fade-in-up group relative rounded-2xl border border-border/70 bg-card/80 p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-md"
              style={{ animationDelay: `${(index + 1) * 0.1}s` }}
            >
              <span className="mb-3 inline-block text-3xl font-black text-primary/20 transition-colors group-hover:text-primary/40">
                {item.step}
              </span>
              <h3 className="mb-2 text-sm font-bold">{item.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tech Stack ────────────────────────────────── */}
      <section className="animate-fade-in-up delay-300 rounded-2xl border border-border/70 bg-card/85 p-6 text-center sm:p-8">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Shield className="h-5 w-5" />
        </div>
        <h2 className="mb-2 text-xl font-bold tracking-tight sm:text-2xl">
          Dibangun dengan Stack Modern
        </h2>
        <p className="mx-auto mb-6 max-w-xl text-sm text-muted-foreground">
          Server-side AI processing, validasi ketat di client dan server,
          rate limiting, input sanitization, dan zero API key exposure.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {techBadges.map((tech) => (
            <Badge
              key={tech}
              variant="outline"
              className="bg-background/60 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-primary/10 hover:text-primary"
            >
              {tech}
            </Badge>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section className="animate-fade-in-up delay-400 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card/90 to-accent/5 px-6 py-10 text-center shadow-lg sm:px-10 sm:py-12">
        <h2 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl">
          Siap membuat spesifikasi produk?
        </h2>
        <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
          Mulai isi intake wizard sekarang dan biarkan AI menyusun dokumen
          BRD, PRD, SRS, dan AGENT.md untuk project Anda.
        </p>
        <Button asChild size="lg" className="group">
          <Link href="/generator">
            <Sparkles className="mr-2 h-4 w-4" />
            Mulai Sekarang
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
