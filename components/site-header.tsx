import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/generator", label: "Generator" },
  { href: "/history", label: "History" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/88 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3 font-semibold text-slate-950">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white">
            <FileText className="h-5 w-5" />
          </span>
          <span>SpecBuilder AI</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Button key={item.href} asChild variant="ghost">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
        <Button asChild className="hidden sm:inline-flex">
          <Link href="/generator">New Draft</Link>
        </Button>
      </div>
    </header>
  );
}
