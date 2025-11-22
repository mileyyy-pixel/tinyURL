import Link from "next/link";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "TinyLink",
    template: "%s · TinyLink",
  },
  description: "TinyLink is a lightweight URL shortener with live analytics.",
  metadataBase: new URL(appUrl),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-slate-50 text-slate-900 antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 lg:px-0">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

const Header = () => (
  <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
    <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 lg:px-0">
      <Link href="/" className="text-lg font-semibold text-slate-900">
        TinyLink
      </Link>
      <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
        <Link href="/" className="hover:text-slate-900">
          Dashboard
        </Link>
        <a
          href="/healthz"
          target="_blank"
          rel="noreferrer"
          className="hover:text-slate-900"
        >
          Healthcheck
        </a>
        <a
          href="https://github.com/yourname/tinylink"
          target="_blank"
          rel="noreferrer"
          className="text-sky-700 hover:text-sky-900"
        >
          GitHub
        </a>
      </nav>
    </div>
  </header>
);

const Footer = () => (
  <footer className="border-t border-slate-200 bg-white">
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 lg:px-0">
      <p>© {new Date().getFullYear()} TinyLink. Built for the take-home.</p>
      <p>Endpoints: /api/links, /code/[code], /healthz</p>
    </div>
  </footer>
);
