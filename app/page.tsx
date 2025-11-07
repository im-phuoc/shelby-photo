"use client";

import { WalletSelector } from "@/components/WalletSelector";
import { PhotoUploader } from "@/components/PhotoUploader";
import { PhotoGallery } from "@/components/PhotoGallery";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { ImageIcon, Wallet, CheckCircle2, XCircle } from "lucide-react";

export default function Home() {
  const { connected, account } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-black dark:to-zinc-950">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg overflow-hidden flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Shelby Photo Logo" 
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold">Shelby Photo dApp</h1>
              <p className="text-xs text-muted-foreground">
                Decentralized photo storage
              </p>
            </div>
          </div>
          <WalletSelector />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">
              Shelby Photo
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                dApp
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload photos to Shelby Protocol decentralized storage on Aptos blockchain.
            </p>
          </div>

          {/* Photo Uploader */}
          <div className="flex justify-center">
            <PhotoUploader />
          </div>

          {/* Photo Gallery */}
          <div className="flex justify-center">
            <PhotoGallery />
          </div>

          {/* Wallet Status - DEBUG VIEW */}
          {/* <div className="border-2 rounded-xl p-8 bg-card shadow-lg">
            <div className="text-center space-y-6">
              {!connected ? (
                <>
                  <div className="h-20 w-20 mx-auto rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                    <XCircle className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      Wallet Not Connected
                    </h3>
                    <p className="text-muted-foreground">
                      Click "Connect a Wallet" button above to get started
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-20 w-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-green-600 dark:text-green-400">
                      ✅ Wallet Connected!
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your wallet is successfully connected
                    </p>
                  </div> */}

                  {/* Wallet Info */}
                  {/* <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Wallet Address
                      </p>
                      <p className="text-lg font-mono font-semibold break-all">
                        {account?.address.toString()}
                      </p>
                    </div>

                    {account?.ansName && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                          ANS Name
                        </p>
                        <p className="text-lg font-semibold">
                          {account.ansName}
                        </p>
                      </div>
                    )}

                    <div className="pt-4 border-t space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Network:</span>
                        <span className="font-medium">Testnet</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          Connected
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div> */}

          {/* Info Card */}
          {/* <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-6">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Adapter Status
            </h4>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Connected:</span>{" "}
                <code className="bg-background px-2 py-0.5 rounded">
                  {connected ? "true" : "false"}
                </code>
              </p>
              <p>
                <span className="text-muted-foreground">Account:</span>{" "}
                <code className="bg-background px-2 py-0.5 rounded">
                  {account ? "✓" : "null"}
                </code>
              </p>
            </div>
          </div> */}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Testing{" "}
            <a
              href="https://aptos.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline"
            >
              Aptos Wallet Adapter
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
