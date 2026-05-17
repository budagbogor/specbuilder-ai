import Link from "next/link";
import { ArrowRight, FileText, Layers3, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const highlights = [
  {
    title: "Brief Terstruktur",
    description: "Susun konteks, ruang lingkup, dan kebutuhan proyek dalam alur yang rapi.",
    icon: Layers3,
  },
  {
    title: "Riwayat Tersimpan",
    description: "Pantau draft spesifikasi dari satu halaman history yang mudah dipindai.",
    icon: FileText,
  },
  {
    title: "Fondasi Siap Tumbuh",
    description: "Stack sudah disiapkan untuk database, validasi, AI, dan ekspor zip.",
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="border-b bg-[radial-gradient(circle_at_top_left,hsl(var(--secondary))_0,transparent_32%),linear-gradient(135deg,#f8fafc_0%,#f4f0e8_48%,#e7f4f2_100%)]">
        <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:py-20">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-5">
              Project Specification Workspace
            </Badge>
            <h1 className="text-4xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
              SpecBuilder AI
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              Ruang kerja modern untuk menyiapkan draft spesifikasi proyek dengan struktur yang jelas, responsif, dan siap dikembangkan.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/generator">
                  Mulai Draft
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/history">Lihat History</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-white/78 p-4 shadow-soft backdrop-blur">
            <div className="rounded-md border bg-slate-950 p-4 text-white">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm text-teal-200">Current draft</p>
                  <h2 className="mt-1 text-xl font-semibold">E-Commerce Redesign</h2>
                </div>
                <Badge className="bg-amber-300 text-amber-950 hover:bg-amber-300">
                  Draft
                </Badge>
              </div>
              <div className="grid gap-3 py-5 sm:grid-cols-3">
                {["Scope", "Features", "Timeline"].map((item) => (
                  <div key={item} className="rounded-md bg-white/8 p-3">
                    <p className="text-xs text-slate-300">{item}</p>
                    <div className="mt-3 h-2 rounded-full bg-white/15">
                      <div className="h-2 w-2/3 rounded-full bg-teal-300" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="h-3 w-full rounded-full bg-white/12" />
                <div className="h-3 w-10/12 rounded-full bg-white/12" />
                <div className="h-3 w-7/12 rounded-full bg-white/12" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-teal-700 text-white">
                  <item.icon className="h-5 w-5" />
                </div>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
