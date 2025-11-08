/**
 * Shelby Protocol Types
 * Based on official Shelby Protocol SDK
 */

export interface EncodingProgress {
  stage: 'encoding' | 'generating-commitments' | 'complete';
  progress: number; // 0-100
  message: string;
}

export interface UploadProgress {
  stage: 'encoding' | 'registering' | 'uploading' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  blobId?: string;
  txHash?: string;
  error?: string;
}

export interface BlobMetadata {
  name: string;
  size: number;
  expiresAt?: number;
  merkleRoot?: string;
  numChunksets?: number;
}

export interface EncodedBlob {
  blob: Blob;
  commitments: string;
  blobId: string;
}
