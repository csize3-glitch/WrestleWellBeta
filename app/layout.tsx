// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "WrestleWell • Beta",
    template: "%s | WrestleWell",
  },
  description:
    "WrestleWell is a training, mindset, goals, and film-study app built for wrestlers, coaches, and parents.",
  metadataBase: new URL("https://YOUR-VERCEL-URL.vercel.app"), // <-- update this once deployed
  icons: {
    icon: "/icon.png",          // from app/icon.png
    apple: "/apple-touch-icon.png",   // from public/apple-icon.png
  },
  themeColor: "#020617", // dark slate background
  manifest: "/manifest.json",   // optional PWA (see note below)

  openGraph: {
    title: "WrestleWell • Wrestling training and mindset beta",
    description:
      "Log training, track goals, study film, and connect coaches and parents in a safe, athlete-first way.",
    url: "https://YOUR-VERCEL-URL.vercel.app", // update
    siteName: "WrestleWell",
    images: [
      {
        url: "/og-wrestlewell.png", // from public/og-wrestlewell.png
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "WrestleWell • Beta",
    description:
      "Training, goals, film study, and a respectful coach/parent view for wrestlers.",
    images: ["/og-wrestlewell.png"],
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WrestleWell",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-slate-950">
      <body className="bg-slate-950 text-slate-50">
        {children}
      </body>
    </html>
  );
}