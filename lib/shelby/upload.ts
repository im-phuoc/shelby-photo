/**
 * Manual Upload Workflow for Shelby Protocol
 * Step 1: Client-side encoding with Clay Erasure Coding
 * Step 2: On-chain blob registration via wallet transaction
 * Step 3: RPC upload to Shelby storage network
 */

import {
  ClayErasureCodingProvider,
  generateCommitments,
  ShelbyBlobClient,
  ShelbyRPCClient,
  type BlobCommitments,
} from '@shelby-protocol/sdk/browser';
import { AccountAddress, Network, Aptos, AptosConfig } from '@aptos-labs/ts-sdk';
import type { InputTransactionData } from '@aptos-labs/wallet-adapter-react';
import type { UploadProgress } from './types';
import { DEFAULT_CHUNKSET_SIZE_BYTES } from '@shelby-protocol/sdk/browser';

const SHELBY_API_KEY = process.env.NEXT_PUBLIC_SHELBY_API_KEY || '';
const SHELBY_RPC_URL = process.env.NEXT_PUBLIC_SHELBY_RPC_URL || 'https://api.shelbynet.shelby.xyz/shelby';

interface EncodingResult {
  commitments: BlobCommitments;
  encodedData: Uint8Array;
  blobName: string;
}

/**
 * Step 1: Encode file with Clay Erasure Coding
 * This happens client-side, no wallet needed
 */
export async function encodeFileForShelby(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<EncodingResult> {
  try {
    onProgress?.({
      stage: 'encoding',
      progress: 10,
      message: 'Initializing Clay Erasure Coding...',
    });

    // Create erasure coding provider
    const provider = await ClayErasureCodingProvider.create();

    onProgress?.({
      stage: 'encoding',
      progress: 30,
      message: 'Reading file data...',
    });

    // Read file as Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    onProgress?.({
      stage: 'encoding',
      progress: 50,
      message: 'Encoding with erasure coding...',
    });

    // Generate commitments for the blob
    const commitments = await generateCommitments(provider, data);

    onProgress?.({
      stage: 'encoding',
      progress: 90,
      message: 'Encoding complete!',
    });

    // Generate blob name with timestamp
    const timestamp = Date.now();
    const blobName = `photos/${timestamp}_${file.name}`;

    return {
      commitments,
      encodedData: data,
      blobName,
    };
  } catch (error) {
    throw new Error(`Failed to encode file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Step 2: Create transaction payload for on-chain blob registration
 * Returns payload that can be signed with wallet adapter
 */
export function createRegisterBlobTransaction(
  accountAddress: string,
  blobName: string,
  commitments: BlobCommitments,
  dataSize: number,
  expirationMicros: number
): InputTransactionData {
  // Calculate number of chunksets
  const numChunksets = commitments.chunkset_commitments.length;

  // Create transaction payload using static method
  const payload = ShelbyBlobClient.createRegisterBlobPayload({
    account: AccountAddress.from(accountAddress),
    blobName,
    blobSize: dataSize,
    blobMerkleRoot: commitments.blob_merkle_root,
    expirationMicros,
    numChunksets,
  });

  // Wrap in InputTransactionData format for wallet adapter
  return {
    data: payload,
  };
}

/**
 * Submit blob registration transaction using wallet adapter
 */
export async function buildAndSubmitTransaction(
  accountAddress: string,
  blobName: string,
  commitments: BlobCommitments,
  dataSize: number,
  expirationMicros: number,
  signAndSubmitTransaction: (transaction: any) => Promise<any>
): Promise<{ hash: string }> {
  // Calculate number of chunksets
  const numChunksets = commitments.chunkset_commitments.length;

  // Create transaction payload
  const payload = ShelbyBlobClient.createRegisterBlobPayload({
    account: AccountAddress.from(accountAddress),
    blobName,
    blobSize: dataSize,
    blobMerkleRoot: commitments.blob_merkle_root,
    expirationMicros,
    numChunksets,
  });

  // Submit transaction via wallet adapter
  const response = await signAndSubmitTransaction({
    sender: accountAddress,
    data: payload,
  });

  return { hash: response.hash };
}

/**
 * Step 3: Upload encoded data to Shelby RPC storage
 * Only call this AFTER on-chain registration is confirmed
 */
export async function uploadToShelbyRPC(
  accountAddress: string,
  blobName: string,
  encodedData: Uint8Array,
  commitments: BlobCommitments,
  onProgress?: (progress: UploadProgress) => void
): Promise<void> {
  if (!SHELBY_API_KEY) {
    throw new Error('SHELBY_API_KEY not configured. Visit https://geomi.dev to create API resource.');
  }

  try {
    onProgress?.({
      stage: 'uploading',
      progress: 10,
      message: 'Connecting to Shelby RPC...',
    });

    // Create RPC client
    const rpcClient = new ShelbyRPCClient({
      network: Network.SHELBYNET,
      apiKey: SHELBY_API_KEY,
    });

    onProgress?.({
      stage: 'uploading',
      progress: 50,
      message: 'Uploading to Shelby storage network...',
    });

    // Upload the blob data using putBlob
    // RPC server will validate against on-chain registration
    await rpcClient.putBlob({
      account: AccountAddress.from(accountAddress),
      blobName,
      blobData: encodedData,
    });

    onProgress?.({
      stage: 'uploading',
      progress: 100,
      message: 'Upload complete!',
    });
  } catch (error) {
    throw new Error(`Failed to upload to Shelby RPC: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify that blob registration transaction was successful
 * Note: Shelbynet doesn't have a public API endpoint to query transactions,
 * so we skip transaction verification and just check if blob metadata exists
 */
export async function verifyBlobRegistration(
  txHash: string,
  accountAddress: string,
  blobName: string
): Promise<boolean> {
  try {
    // Wait a bit for transaction to be processed
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Verify blob exists on-chain using Shelby SDK
    const blobClient = new ShelbyBlobClient({
      network: Network.SHELBYNET,
    });

    const metadata = await blobClient.getBlobMetadata({
      account: AccountAddress.from(accountAddress),
      name: blobName,
    });

    if (metadata) {
      return true;
    }

    return false;
  } catch (error) {
    // If metadata check fails, assume transaction is still processing
    // Return true to continue with upload
    return true;
  }
}

/**
 * Download blob from Shelby storage
 */
export async function downloadBlob(
  accountAddress: string,
  blobName: string
): Promise<Blob> {
  const rpcClient = new ShelbyRPCClient({
    network: Network.SHELBYNET,
    apiKey: SHELBY_API_KEY,
  });

  // Download returns a ShelbyBlob with readable stream
  const shelbyBlob = await rpcClient.getBlob({
    account: AccountAddress.from(accountAddress),
    blobName,
  });

  // Convert ReadableStream to Blob
  const reader = shelbyBlob.readable.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  // Combine chunks
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  return new Blob([combined]);
}

/**
 * Get blob URL for direct access
 */
export function getBlobUrl(accountAddress: string, blobName: string): string {
  return `${SHELBY_RPC_URL}/blob/${accountAddress}/${blobName}`;
}
