import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Sora, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
  display: "swap",
});

const ibmMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  ),
  title: "Cortex Capital — AI Hedge Fund Swarm | YC S26",
  description:
    "I'm building Cortex Capital: an AI-native research and trading system where autonomous agents debate markets, size risk, and learn from live results.",
  openGraph: {
    title: "Cortex Capital — AI Hedge Fund Swarm | YC S26",
    description:
      "Public dashboard for a live multi-agent trading swarm. Paper execution today; LangGraph + IBKR tomorrow.",
    siteName: "Cortex Capital",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cortex Capital — AI Hedge Fund Swarm | YC S26",
    description: "AI-native hedge fund swarm. Live demo.",
  },
};

export const viewport: Viewport = {
  themeColor: "#06080f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${jakarta.variable} ${sora.variable} ${ibmMono.variable} min-h-dvh font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
