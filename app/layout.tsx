import type { Metadata } from "next";
import Link from "next/link";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const navItems = [
  { href: "/", label: "Landing" },
  { href: "/generator", label: "Generator" },
  { href: "/history", label: "History" },
];

export const metadata: Metadata = {
  title: "SpecBuilder AI",
  description: "Starter UI project for SpecBuilder AI with Next.js App Router.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <ToastProvider>
          <div className="relative min-h-screen overflow-x-clip">
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute left-1/2 top-[-280px] h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(39,103,224,0.28)_0%,_rgba(39,103,224,0)_70%)]" />
              <div className="absolute bottom-[-220px] right-[-150px] h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,_rgba(26,157,128,0.26)_0%,_rgba(26,157,128,0)_72%)]" />
            </div>

            <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-lg">
              <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                <Link
                  href="/"
                  className="text-sm font-semibold tracking-[0.16em] uppercase"
                >
                  SpecBuilder AI
                </Link>
                <nav className="flex items-center gap-1 rounded-full border border-border/70 bg-card/70 p-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </header>

            <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
              {children}
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
