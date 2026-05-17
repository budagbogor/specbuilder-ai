import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NavLink } from "@/components/ui/nav-link";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const navItems = [
  { href: "/", label: "Home" },
  { href: "/generator", label: "Generator" },
  { href: "/history", label: "History" },
];

export const metadata: Metadata = {
  title: "SpecBuilder AI — Generate BRD, PRD, SRS & AGENT.md",
  description:
    "AI-powered specification builder yang membantu Anda membuat dokumen BRD, PRD, SRS, dan AGENT.md secara otomatis dengan workflow bertahap dan konsisten.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`h-full antialiased ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('specbuilder-theme');
                  if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <ToastProvider>
          <div className="relative min-h-screen overflow-x-clip">
            {/* Background gradient orbs */}
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute left-1/2 top-[-280px] h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_oklch(0.56_0.16_256_/_0.22)_0%,_transparent_70%)] animate-pulse-glow" />
              <div className="absolute bottom-[-220px] right-[-150px] h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,_oklch(0.55_0.14_173_/_0.2)_0%,_transparent_72%)] animate-pulse-glow delay-300" />
            </div>

            <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-xl">
              <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                <a
                  href="/"
                  className="group flex items-center gap-2 text-sm font-semibold tracking-[0.16em] uppercase transition-opacity hover:opacity-80"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                    S
                  </span>
                  <span className="hidden sm:inline">SpecBuilder AI</span>
                </a>

                <div className="flex items-center gap-2">
                  <nav className="flex items-center gap-1 rounded-full border border-border/70 bg-card/70 p-1 backdrop-blur-sm">
                    {navItems.map((item) => (
                      <NavLink key={item.href} href={item.href}>
                        {item.label}
                      </NavLink>
                    ))}
                  </nav>
                  <ThemeToggle />
                </div>
              </div>
            </header>

            <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
              {children}
            </main>

            <footer className="border-t border-border/50 bg-background/60 backdrop-blur-sm">
              <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <p className="text-xs text-muted-foreground">
                  © 2026 SpecBuilder AI
                </p>
                <p className="text-xs text-muted-foreground">
                  Built with Next.js + OpenAI
                </p>
              </div>
            </footer>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
