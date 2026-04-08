import type { Metadata } from "next";
import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const stripBitwardenMarkerScript = `
(() => {
  const ATTR = "bis_skin_checked";
  const strip = () => {
    document.querySelectorAll("[" + ATTR + "]").forEach((el) => {
      el.removeAttribute(ATTR);
    });
  };

  strip();

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes" && mutation.attributeName === ATTR) {
        const target = mutation.target;
        if (target instanceof Element) {
          target.removeAttribute(ATTR);
        }
      }
    }
  });

  observer.observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: [ATTR],
  });

  window.addEventListener(
    "load",
    () => {
      observer.disconnect();
    },
    { once: true }
  );
})();
`;

const ibmSans = IBM_Plex_Sans({
  variable: "--font-ibm",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "PolyTerm — Terminal",
  description:
    "Polymarket analytics: Bloomberg-style terminal UI. Gamma, CLOB, Data API.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: stripBitwardenMarkerScript }} />
      </head>
      <body
        suppressHydrationWarning
        className={`${ibmSans.variable} ${jetbrains.variable} min-h-svh bg-background font-sans text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
