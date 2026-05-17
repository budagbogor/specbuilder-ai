import { FilePenLine, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function GeneratorPage() {
  return (
    <main className="min-h-[calc(100vh-73px)] px-5 py-8 sm:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 border-b pb-8 lg:flex-row lg:items-end">
          <div>
            <Badge variant="secondary" className="mb-4">
              Generator
            </Badge>
            <h1 className="text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
              Buat Draft Spesifikasi
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Masukkan ringkasan proyek, konteks bisnis, dan prioritas awal untuk menyiapkan fondasi spesifikasi.
            </p>
          </div>
          <Button disabled size="lg" className="w-full sm:w-fit">
            <Sparkles className="h-4 w-4" />
            Generate
          </Button>
        </div>

        <div className="grid gap-6 py-8 lg:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader>
              <CardTitle>Project Brief</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="project-name">Nama Proyek</Label>
                <Input id="project-name" placeholder="Contoh: Marketplace UMKM Bogor" />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="client">Klien</Label>
                  <Input id="client" placeholder="Nama perusahaan atau tim" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="industry">Industri</Label>
                  <Input id="industry" placeholder="Retail, edukasi, SaaS" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="summary">Ringkasan</Label>
                <Textarea
                  id="summary"
                  placeholder="Tuliskan kebutuhan utama, target pengguna, dan hasil yang diharapkan."
                  rows={7}
                />
              </div>
            </CardContent>
          </Card>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-700 text-white">
                    <FilePenLine className="h-5 w-5" />
                  </div>
                  <CardTitle>Draft Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-sm text-muted-foreground">AI Logic</span>
                  <Badge variant="outline">Belum aktif</Badge>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-sm text-muted-foreground">Document Export</span>
                  <Badge variant="outline">Belum aktif</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Storage</span>
                  <Badge className="bg-teal-700 text-white hover:bg-teal-700">
                    Ready
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
