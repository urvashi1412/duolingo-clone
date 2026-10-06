import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Duolingo Clone — Learn Spanish",
  description: "SDE Fullstack assignment — Duolingo-style learning path",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${nunito.variable} min-h-screen bg-duo-sky dark:bg-gray-950`}
      >
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 bg-gradient-to-b from-duo-sky to-duo-path pb-16 dark:from-gray-900 dark:to-gray-950 md:pb-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
