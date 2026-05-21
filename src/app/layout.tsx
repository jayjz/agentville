import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentVille 1996",
  description: "Multi-agent orchestration in a retro Windows 95 desktop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full overflow-hidden antialiased">
        {children}
      </body>
    </html>
  );
}