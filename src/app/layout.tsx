import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NoWave E-Menu — No Wave. Just Tilt.",
  description:
    "A digital restaurant menu designed to pair with smart table service lamps.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-parchment dark:bg-charcoal transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
