"use client";

import { WalletSelector } from "@/components/WalletSelector";
import { PhotoUploader } from "@/components/PhotoUploader";
import { PhotoGallery } from "@/components/PhotoGallery";

export default function Home() {
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
              <h1 className="text-xl font-bold">Shelby Photo</h1>
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
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Built by{" "}
            <a
              href="https://meganode.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline"
            >
              Dmitri | MegaNode
            </a>
            {" "}•{" "}
            Powered by{" "}
            <a
              href="https://shelby.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline"
            >
              Shelby Protocol
            </a>
            {" "}on{" "}
            <a
              href="https://aptos.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline"
            >
              Aptos
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
