import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Abascus",
  description: "3D holographic project exhibition and deployment platform.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
