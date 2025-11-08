'use client';

/**
 * Photo Uploader Component
 * Implements manual 3-step workflow for Shelby Protocol:
 * 1. Client-side encoding with Clay Erasure Coding
 * 2. On-chain blob registration via wallet transaction
 * 3. RPC upload to Shelby storage network
 */

import { useState, useCallback } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useToast } from '@/components/ui/use-toast';
import type { UploadProgress } from '@/lib/shelby/types';
import {
  encodeFileForShelby,
  buildAndSubmitTransaction,
  uploadToShelbyRPC,
  verifyBlobRegistration,
} from '@/lib/shelby/upload';
import { SHELBYNET_CONFIG } from '@/lib/shelby/network';
import { Upload, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export function PhotoUploader() {
  const { account, signAndSubmitTransaction } = useWallet();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [uploadedBlobName, setUploadedBlobName] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file.',
        });
        return;
      }

      // Validate file size (max 10MB for demo)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 10MB.',
        });
        return;
      }

      // Validate wallet connection
      if (!account) {
        toast({
          title: 'Wallet not connected',
          description: 'Please connect your wallet first.',
        });
        return;
      }

      setUploading(true);
      setProgress({
        stage: 'encoding',
        progress: 0,
        message: 'Starting upload...',
      });

      try {
        // ===== STEP 1: Encode file with Clay Erasure Coding =====
        setProgress({
          stage: 'encoding',
          progress: 10,
          message: 'Step 1/3: Encoding file...',
        });

        const { commitments, encodedData, blobName } = await encodeFileForShelby(
          file,
          setProgress
        );

        // ===== STEP 2: Register blob on-chain =====
        setProgress({
          stage: 'registering',
          progress: 40,
          message: 'Step 2/3: Registering on blockchain...',
        });

        // Create transaction and submit to SHELBYNET
        const expirationMicros = Date.now() * 1000 + 86400_000_000; // 24 hours

        setProgress({
          stage: 'registering',
          progress: 50,
          message: 'Please approve transaction in your wallet...',
        });

        // Build transaction for Shelbynet and sign with wallet
        const txResponse = await buildAndSubmitTransaction(
          account.address.toString(),
          blobName,
          commitments,
          encodedData.length,
          expirationMicros,
          signAndSubmitTransaction
        );

        setProgress({
          stage: 'registering',
          progress: 60,
          message: 'Waiting for transaction confirmation...',
        });

        // Verify registration was successful
        const isRegistered = await verifyBlobRegistration(
          txResponse.hash,
          account.address.toString(),
          blobName
        );

        if (!isRegistered) {
          throw new Error('Blob registration failed - transaction not confirmed');
        }

        // ===== STEP 3: Upload to Shelby RPC storage =====
        setProgress({
          stage: 'uploading',
          progress: 70,
          message: 'Step 3/3: Uploading to Shelby storage...',
        });

        await uploadToShelbyRPC(
          account.address.toString(),
          blobName,
          encodedData,
          commitments,
          setProgress
        );

        // ===== SUCCESS =====
        setUploadedBlobName(blobName);

        toast({
          title: 'Upload successful! 🎉',
          description: `Photo uploaded: ${blobName}`,
        });

        setProgress({
          stage: 'complete',
          progress: 100,
          message: 'Upload complete!',
          blobId: blobName,
          txHash: txResponse.hash,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        toast({
          title: 'Upload failed',
          description: errorMessage,
          variant: 'destructive',
        });

        setProgress({
          stage: 'error',
          progress: 0,
          message: 'Upload failed',
          error: errorMessage,
        });
      } finally {
        setUploading(false);
        // Reset input
        event.target.value = '';
      }
    },
    [account, signAndSubmitTransaction, toast]
  );

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Upload Photo</h2>

        {!account ? (
          <div className="text-center text-muted-foreground py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Please connect your wallet to upload photos.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              <label
                htmlFor="photo-upload"
                className={`
                  flex flex-col items-center justify-center
                  border-2 border-dashed rounded-lg
                  p-8 cursor-pointer
                  transition-colors
                  ${
                    uploading
                      ? 'border-gray-400 bg-gray-50 dark:bg-gray-900 cursor-not-allowed'
                      : 'border-primary hover:border-primary/80 hover:bg-accent'
                  }
                `}
              >
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                />

                {uploading ? (
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                ) : (
                  <Upload className="h-12 w-12 text-primary" />
                )}

                <p className="mt-4 text-sm text-muted-foreground">
                  {uploading ? 'Uploading...' : 'Click to select a photo'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Max 10MB • PNG, JPG, GIF
                </p>
              </label>

              {progress && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{progress.message}</span>
                    <span className="text-muted-foreground">{progress.progress}%</span>
                  </div>

                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        progress.stage === 'error'
                          ? 'bg-destructive'
                          : progress.stage === 'complete'
                          ? 'bg-green-500'
                          : 'bg-primary'
                      }`}
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    {progress.stage === 'complete' && (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-green-500">Upload successful!</span>
                      </>
                    )}
                    {progress.stage === 'error' && (
                      <>
                        <XCircle className="h-4 w-4 text-destructive" />
                        <span className="text-destructive">{progress.error}</span>
                      </>
                    )}
                    {progress.txHash && (
                      <div className="flex gap-2 items-center">
                        <a
                          href={`https://explorer.aptoslabs.com/txn/${progress.txHash}?network=shelbynet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline"
                        >
                          View on Shelbynet Explorer →
                        </a>
                        <span className="text-xs text-muted-foreground">|</span>
                        <a
                          href={`https://explorer.aptoslabs.com/txn/${progress.txHash}?network=testnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-500 hover:underline"
                        >
                          Testnet
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {uploadedBlobName && !uploading && (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    ✓ Latest upload:
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 font-mono mt-1 break-all">
                    {uploadedBlobName}
                  </p>
                </div>
              )}
            </div>


          </>
        )}
      </div>
    </div>
  );
}
