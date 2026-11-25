import type { Metadata, Viewport } from "next";
import { Newsreader, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ProgressHydrator } from "@/components/site/ProgressHydrator";

const display = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600"]
});

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600"]
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500"]
});

export const metadata: Metadata = {
  title: {
    default: "Quantum Optics Laboratory — Undergraduate Experimental Physics",
    template: "%s · Quantum Optics Laboratory"
  },
  description:
    "An interactive undergraduate quantum optics laboratory: eight experiments, verified optical hardware, physical simulations, measurement analysis and examination preparation.",
  keywords: [
    "quantum optics",
    "undergraduate laboratory",
    "Michelson interferometer",
    "Mach-Zehnder",
    "BB84",
    "optical tweezers",
    "Fourier optics"
  ],
  authors: [{ name: "Quantum Optics Laboratory" }],
  openGraph: {
    title: "Quantum Optics Laboratory",
    description: "Eight experiments. Theory, simulation, measurement and analysis in one working laboratory.",
    type: "website"
  }
};

export const viewport: Viewport = {
  themeColor: "#F6F3ED",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <ProgressHydrator />
        <SiteHeader />
        <main id="main" className="relative z-[1] min-h-[60vh]">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
