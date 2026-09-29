import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Abascus — Project Intelligence",
    template: "%s — Abascus",
  },
  description: "A high-performance 3D holographic exhibition and deployment platform for technical projects.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
