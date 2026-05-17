import Link from "next/link";
import { Clock4, FileStack, Sparkles, WandSparkles } from "lucide-react";
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
    title: "Fast Spec Drafting",
    description:
      "Rancang spesifikasi produk dengan struktur yang konsisten dan rapi.",
    icon: WandSparkles,
  },
  {
    title: "Template Ready",
    description:
      "Siap untuk integrasi template dokumen kapan saja di tahap berikutnya.",
    icon: FileStack,
  },
  {
    title: "Session History",
    description:
      "Kelola riwayat output agar revisi dan kolaborasi tim jadi lebih mudah.",
    icon: Clock4,
  },
];

export default function Home() {
  return (
    <div className="space-y-8 pb-6 sm:space-y-10">
      <section className="rounded-3xl border border-border/70 bg-card/90 px-6 py-8 shadow-[0_28px_80px_-48px_rgba(28,36,56,0.58)] backdrop-blur sm:px-9 sm:py-10">
        <Badge className="mb-4" variant="secondary">
          Next.js App Router Starter
        </Badge>
        <div className="max-w-3xl space-y-4">
          <h1 className="text-3xl font-semibold leading-tight sm:text-5xl">
            Bangun spesifikasi produk lebih cepat dengan
            <span className="text-primary"> SpecBuilder AI</span>.
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            Fondasi project sudah siap dengan TypeScript, Tailwind, shadcn/ui,
            Prisma, SQLite, Zod, OpenAI SDK, dan JSZip. Tahap ini fokus ke UI,
            tanpa logic AI atau generator dokumen.
          </p>
        </div>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/generator">
              Mulai Generator
              <Sparkles className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/history">Lihat History</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <Card key={item.title} className="transition-transform duration-200 hover:-translate-y-1">
            <CardHeader>
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              UI ini sengaja dibuat modular supaya tahap penambahan logic AI dan
              ekspor dokumen bisa dilakukan cepat di iterasi berikutnya.
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
