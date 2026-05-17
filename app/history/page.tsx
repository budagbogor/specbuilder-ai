import { CalendarClock, FileText, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const histories = [
  {
    title: "Marketplace UMKM Bogor",
    client: "Budag Bogor",
    date: "17 Mei 2026",
    status: "Draft",
  },
  {
    title: "Dashboard Training Online",
    client: "Internal Team",
    date: "16 Mei 2026",
    status: "Review",
  },
  {
    title: "CRM Sales Pipeline",
    client: "Sales Ops",
    date: "15 Mei 2026",
    status: "Archived",
  },
];

export default function HistoryPage() {
  return (
    <main className="min-h-[calc(100vh-73px)] px-5 py-8 sm:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 border-b pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="secondary" className="mb-4">
              History
            </Badge>
            <h1 className="text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
              Riwayat Spesifikasi
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Daftar draft spesifikasi yang sudah dibuat akan tampil di sini saat penyimpanan diaktifkan.
            </p>
          </div>
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-10" placeholder="Cari draft" />
          </div>
        </div>

        <div className="grid gap-4 py-8">
          {histories.map((item) => (
            <Card key={item.title}>
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-medium text-slate-950">{item.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{item.client}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarClock className="h-4 w-4" />
                    {item.date}
                  </span>
                  <Badge variant={item.status === "Archived" ? "outline" : "secondary"}>
                    {item.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
