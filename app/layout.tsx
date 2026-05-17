import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";


export const metadata: Metadata = {
  title: "SpecBuilder AI",
  description: "Workspace modern untuk menyusun spesifikasi proyek.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen font-sans">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
