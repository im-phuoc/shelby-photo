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
  title: "Shelby Photo dApp",
  description: "Decentralized photo storage with Aptos + Shelby",
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
