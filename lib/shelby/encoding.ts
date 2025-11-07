/**
 * Shelby Protocol Upload Utilities
 * Uses ShelbyClient which handles all 3 steps internally:
 * 1. File encoding with Clay Erasure Coding
 * 2. On-chain blob registration
 * 3. RPC upload to storage network
 */

import { ShelbyClient, ClayErasureCodingProvider } from '@shelby-protocol/sdk/browser';
import { Account, Network } from '@aptos-labs/ts-sdk';
import type { ShelbyClientConfig } from '@shelby-protocol/sdk/browser';
import type { UploadProgress } from './types';

const SHELBY_API_KEY = process.env.NEXT_PUBLIC_SHELBY_API_KEY || '';

export async function uploadPhotoToShelby(
  file: File,
  signer: Account,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  if (!SHELBY_API_KEY) {
    throw new Error('SHELBY_API_KEY not configured. Visit https://geomi.dev to create API resource.');
  }

  try {
    onProgress?.({
      stage: 'encoding',
      progress: 10,
      message: 'Initializing Shelby client...',
    });

    // Create Shelby client config
    const config: ShelbyClientConfig = {
      network: Network.SHELBYNET,
      apiKey: SHELBY_API_KEY,
    };

    // Create erasure coding provider (shared across uploads)
    const provider = await ClayErasureCodingProvider.create();
    
    // Create Shelby client with provider
    const client = new ShelbyClient(config, provider);

    onProgress?.({
      stage: 'encoding',
      progress: 30,
      message: 'Reading file data...',
    });

    // Read file as Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const blobData = new Uint8Array(arrayBuffer);

    // Generate blob name from file name + timestamp
    const timestamp = Date.now();
    const blobName = `photos/${timestamp}_${file.name}`;

    onProgress?.({
      stage: 'registering',
      progress: 50,
      message: 'Uploading to Shelby network (encoding + registration + storage)...',
    });

    // Upload handles all 3 steps internally:
    // 1. Encoding with Clay Erasure Coding
    // 2. On-chain blob registration (costs 1 ShelbyUSD)
    // 3. RPC upload to storage network
    await client.upload({
      blobData,
      signer,
      blobName,
      expirationMicros: timestamp * 1000 + 86400_000_000, // 24 hours
    });

    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Upload complete!',
      blobId: blobName,
    });

    return blobName;
  } catch (error) {
    console.error('Upload error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    onProgress?.({
      stage: 'error',
      progress: 0,
      message: 'Upload failed',
      error: errorMessage,
    });
    
    throw new Error(`Failed to upload photo: ${errorMessage}`);
  }
}

export async function downloadPhotoFromShelby(
  account: string,
  blobName: string
): Promise<Blob> {
  const config: ShelbyClientConfig = {
    network: Network.SHELBYNET,
    apiKey: SHELBY_API_KEY,
  };

  const client = new ShelbyClient(config);

  const shelbyBlob = await client.download({
    account,
    blobName,
  });

  // Read from readable stream to Blob
  const reader = shelbyBlob.readable.getReader();
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  // Combine all chunks
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }
  
  return new Blob([combined]);
}

export function getPhotoUrl(account: string, blobName: string): string {
  const RPC_URL = process.env.NEXT_PUBLIC_SHELBY_RPC_URL || 'https://rpc.mainnet.shelby.dev';
  return `${RPC_URL}/blob/${account}/${blobName}`;
}
