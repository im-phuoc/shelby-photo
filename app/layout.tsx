import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AutoConnectProvider } from "@/components/AutoConnectProvider";
import { ReactQueryClientProvider } from "@/components/ReactQueryClientProvider";
import { TransactionSubmitterProvider } from "@/components/TransactionSubmitterProvider";
import { WalletProvider } from "@/components/WalletProvider";
// import { ShelbyProvider } from "@/components/ShelbyProvider"; // DISABLED FOR TESTING
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Shelby Photo - Decentralized Photo Storage",
  description: "Upload and store photos on decentralized storage powered by Shelby Protocol and Aptos blockchain. Secure, permanent, and censorship-resistant.",
  keywords: ["Shelby", "Aptos", "decentralized storage", "photo storage", "blockchain", "web3", "dApp"],
  authors: [{ name: "Dmitri | MegaNode" }],
  openGraph: {
    title: "Shelby Photo",
    description: "Decentralized photo storage on Aptos blockchain",
    url: "https://shelby-photo.vercel.app",
    siteName: "Shelby Photo",
    type: "website",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Shelby Photo - Decentralized Photo Storage",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shelby Photo",
    description: "Decentralized photo storage on Aptos blockchain",
    images: ["/api/og"],
  },
  icons: {
    icon: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AutoConnectProvider>
            <ReactQueryClientProvider>
              <TransactionSubmitterProvider>
                <WalletProvider>
                  {children}
                  <Toaster />
                </WalletProvider>
              </TransactionSubmitterProvider>
            </ReactQueryClientProvider>
          </AutoConnectProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
