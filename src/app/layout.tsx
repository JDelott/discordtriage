import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Discord Triage",
  description: "Streamline your Discord server management with automated message organization and priority handling.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}
