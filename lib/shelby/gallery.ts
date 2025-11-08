/**
 * Shelby Gallery Functions
 * Helper functions to list and download blobs from Shelby storage
 */

import { Network, AccountAddress } from '@aptos-labs/ts-sdk';
import { ShelbyBlobClient } from '@shelby-protocol/sdk/browser';
import type { BlobMetadata } from './types';

const SHELBY_API_KEY = process.env.NEXT_PUBLIC_SHELBY_API_KEY || '';

/**
 * Get all blobs for a specific account
 */
export async function getBlobsForAccount(
  accountAddress: string
): Promise<BlobMetadata[]> {
  try {
    const blobClient = new ShelbyBlobClient({
      network: Network.SHELBYNET,
      apiKey: SHELBY_API_KEY,
    });

    // Get all blobs for this account
    const blobs = await blobClient.getAccountBlobs({
      account: AccountAddress.from(accountAddress),
    });

    // Transform to our BlobMetadata format
    const metadata: BlobMetadata[] = blobs.map((blob: any) => ({
      // Use blobNameSuffix if available (this is the actual path without account prefix)
      // Otherwise fall back to name/blob_name
      name: blob.blobNameSuffix || blob.blob_name || blob.name,
      size: blob.size || blob.blob_size || 0,
      expiresAt: blob.expires_at
        ? Number(blob.expires_at) / 1000
        : blob.expiration_micros
        ? Number(blob.expiration_micros) / 1000
        : undefined,
      merkleRoot: blob.blob_commitment || blob.blob_merkle_root,
      numChunksets: blob.num_chunksets,
    }));

    return metadata;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to get account blobs:', error);
    }
    throw error;
  }
}

/**
 * Download blob from Shelby storage via API proxy to avoid CORS issues
 */
export async function downloadBlob(
  accountAddress: string,
  blobName: string
): Promise<Blob> {
  // Use Next.js API route to proxy the download (avoids CORS issues)
  const params = new URLSearchParams({
    account: accountAddress,
    name: blobName,
  });

  const response = await fetch(`/api/blob/download?${params}`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Download failed' }));
    throw new Error(error.error || `Download failed: ${response.status}`);
  }

  return await response.blob();
}
