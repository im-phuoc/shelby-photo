'use client';

/**
 * Photo Gallery Component
 * Displays all uploaded photos for the connected wallet
 */

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useToast } from '@/components/ui/use-toast';
import { getBlobsForAccount, downloadBlob } from '@/lib/shelby/gallery';
import type { BlobMetadata } from '@/lib/shelby/types';
import { Loader2, Image as ImageIcon, Download, Trash2 } from 'lucide-react';

export function PhotoGallery() {
  const { account } = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [blobs, setBlobs] = useState<BlobMetadata[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Map<string, string>>(new Map());

  const loadBlobs = useCallback(async () => {
    if (!account) return;

    setLoading(true);
    try {
      const accountBlobs = await getBlobsForAccount(account.address.toString());
      
      setBlobs(accountBlobs);

      // Load previews for image files
      const newPreviewUrls = new Map<string, string>();
      let successCount = 0;
      let failCount = 0;
      
      for (const blob of accountBlobs) {
        try {
          // Only preview image files
          if (blob.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            const blobData = await downloadBlob(account.address.toString(), blob.name);
            const url = URL.createObjectURL(blobData);
            newPreviewUrls.set(blob.name, url);
            successCount++;
          }
        } catch (error) {
          // Silent fail - just mark as error without spamming console
          failCount++;
          // Mark as failed so we can show error state
          newPreviewUrls.set(blob.name, 'error');
        }
      }
      
      setPreviewUrls(newPreviewUrls);
    } catch (error) {
      toast({
        title: 'Failed to load gallery',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [account]); // Removed 'toast' from dependencies to prevent infinite loop

  useEffect(() => {
    loadBlobs();
  }, [loadBlobs]);

  const handleDownload = async (blobName: string) => {
    if (!account) return;

    try {
      const blob = await downloadBlob(account.address.toString(), blobName);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = blobName.split('/').pop() || 'download';
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Download started',
        description: `Downloading ${blobName}`,
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  if (!account) {
    return (
      <div className="w-full max-w-4xl">
        <div className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Photo Gallery</h2>
          <p className="text-muted-foreground text-center py-8">
            Please connect your wallet to view your photos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Photo Gallery</h2>
          <button
            onClick={loadBlobs}
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="inline h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Refresh'
            )}
          </button>
        </div>

        {loading && blobs.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : blobs.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No photos uploaded yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Upload your first photo using the uploader above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blobs.map((blob) => (
              <div
                key={blob.name}
                className="group relative rounded-lg border border-border overflow-hidden bg-muted hover:border-primary transition-colors"
              >
                {/* Image Preview */}
                <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                  {previewUrls.get(blob.name) === 'error' ? (
                    <div className="flex flex-col items-center gap-2 text-destructive">
                      <ImageIcon className="h-12 w-12 opacity-50" />
                      <span className="text-xs">Failed to load</span>
                    </div>
                  ) : previewUrls.has(blob.name) ? (
                    <img
                      src={previewUrls.get(blob.name)}
                      alt={blob.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Loading...</span>
                    </div>
                  )}
                </div>

                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleDownload(blob.name)}
                    className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    title="Download"
                  >
                    <Download className="h-5 w-5 text-gray-900" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-3 bg-card">
                  <p className="text-xs font-mono truncate" title={blob.name}>
                    {blob.name.split('/').pop()}
                  </p>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>{(blob.size / 1024).toFixed(1)} KB</span>
                    {blob.expiresAt && (
                      <span>
                        Expires: {new Date(blob.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {blobs.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing {blobs.length} photo{blobs.length !== 1 ? 's' : ''} uploaded to Shelby Protocol.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
