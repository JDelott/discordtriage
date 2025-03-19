import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Discord Triage",
  description: "Streamline your Discord server management with automated message organization and priority handling.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Start the bot when the app loads
  await fetch('http://localhost:3000/api/bot');

  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}
