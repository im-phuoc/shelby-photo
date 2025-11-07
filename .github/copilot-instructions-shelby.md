# GitHub Copilot Instructions - Aptos + Shelby Protocol dApp

## 🎯 Project Overview
Next.js 16 + React 19 dApp for decentralized file storage using:
- **Aptos Wallet Adapter** - Wallet connection & blockchain transactions
- **Shelby Protocol SDK** (`@shelby-protocol/sdk/browser`) - Decentralized blob storage
- **Network**: `Network.SHELBYNET`

---

## 📦 Required Packages

```bash
pnpm add @shelby-protocol/sdk @aptos-labs/ts-sdk
pnpm add @aptos-labs/wallet-adapter-react @aptos-labs/wallet-adapter-core
```

---

## 🔄 **SHELBY UPLOAD WORKFLOW (3 STEPS)**

### **Step 1: File Encoding** 
**Purpose**: Generate cryptographic commitments for file chunks

```typescript
import {
  type BlobCommitments,
  ClayErasureCodingProvider,
  generateCommitments,
} from "@shelby-protocol/sdk/browser";

// Convert File to Buffer
const fileBuffer = Buffer.from(await file.arrayBuffer());

// Initialize erasure coding provider
const provider = await ClayErasureCodingProvider.create();

// Generate commitments (blob merkle root + chunk hashes)
const commitments: BlobCommitments = await generateCommitments(
  provider,
  fileBuffer
);

// commitments contains:
// - blob_merkle_root: Root hash for verification
// - raw_data_size: Original file size
// - chunkset_commitments: Array of chunk hashes
```

**Key Points:**
- Uses **Clay Erasure Coding** to split file into chunks
- Generates **merkle root** hash for on-chain verification
- No API calls - pure client-side computation

---

### **Step 2: On-Chain Registration**
**Purpose**: Register file metadata on Aptos blockchain

```typescript
import {
  ShelbyBlobClient,
  expectedTotalChunksets,
} from "@shelby-protocol/sdk/browser";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const { account, signAndSubmitTransaction } = useWallet();

// Create Aptos client (for waiting transaction)
const aptosClient = new Aptos(
  new AptosConfig({
    network: Network.SHELBYNET,
    clientConfig: {
      API_KEY: process.env.NEXT_PUBLIC_APTOS_API_KEY,
    },
  })
);

// Create registration transaction payload
const payload = ShelbyBlobClient.createRegisterBlobPayload({
  account: account.address,
  blobName: file.name, // File name in Shelby
  blobMerkleRoot: commitments.blob_merkle_root,
  numChunksets: expectedTotalChunksets(commitments.raw_data_size),
  expirationMicros: (Date.now() + 1000 * 60 * 60 * 24 * 30) * 1000, // 30 days
  blobSize: commitments.raw_data_size,
});

// Submit transaction via wallet
const txResponse = await signAndSubmitTransaction({
  data: payload,
});

// CRITICAL: Wait for transaction confirmation before Step 3
await aptosClient.waitForTransaction({
  transactionHash: txResponse.hash,
});
```

**Key Points:**
- Transaction registers **blob metadata** on Aptos blockchain
- Wallet pays **1 ShelbyUSD** per upload (need ShelbyUSD tokens!)
- **MUST wait** for confirmation before RPC upload
- Uses `ShelbyBlobClient.createRegisterBlobPayload()` static method

---

### **Step 3: RPC Upload**
**Purpose**: Upload actual file data to Shelby storage network

```typescript
import { ShelbyClient } from "@shelby-protocol/sdk/browser";
import { Network } from "@aptos-labs/ts-sdk";

// Initialize Shelby client
const shelbyClient = new ShelbyClient({
  network: Network.SHELBYNET,
  apiKey: process.env.NEXT_PUBLIC_SHELBY_API_KEY, // From geomi.dev
});

// Upload file data to RPC
await shelbyClient.rpc.putBlob({
  account: account.address,
  blobName: file.name,
  blobData: new Uint8Array(await file.arrayBuffer()),
});
```

**Key Points:**
- RPC validates file against on-chain registration
- Upload fails if Step 2 not completed
- Uses API key from geomi.dev for authentication
- Handles multipart upload internally

---

## 📥 **FILE DOWNLOAD WORKFLOW**

### **Method 1: Direct URL**
```typescript
// Direct download via HTTP
const downloadUrl = `https://api.shelbynet.shelby.xyz/shelby/v1/blobs/${accountAddress}/${fileName}`;
```

### **Method 2: SDK API**
```typescript
import { ShelbyClient } from "@shelby-protocol/sdk/browser";

const shelbyClient = new ShelbyClient({
  network: Network.SHELBYNET,
  apiKey: process.env.NEXT_PUBLIC_SHELBY_API_KEY,
});

// Get all files for an account
const blobs = await shelbyClient.coordination.getAccountBlobs({
  account: accountAddress,
});

// Get specific file
const blob = await shelbyClient.rpc.getBlob({
  account: accountAddress,
  blobName: fileName,
});

// blob.readable is a ReadableStream
```

---

## 🏗️ **COMPONENT STRUCTURE**

### **PhotoUploader.tsx** (Complete Example)
```typescript
"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import {
  ClayErasureCodingProvider,
  generateCommitments,
  ShelbyBlobClient,
  ShelbyClient,
  expectedTotalChunksets,
} from "@shelby-protocol/sdk/browser";
import { toast } from "sonner";

export function PhotoUploader() {
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    if (!connected || !account) {
      toast.error("Wallet not connected");
      return;
    }

    setUploading(true);

    try {
      // STEP 1: File Encoding
      toast.info("Step 1/3: Encoding file...");
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const provider = await ClayErasureCodingProvider.create();
      const commitments = await generateCommitments(provider, fileBuffer);

      // STEP 2: On-Chain Registration
      toast.info("Step 2/3: Registering on blockchain...");
      const payload = ShelbyBlobClient.createRegisterBlobPayload({
        account: account.address,
        blobName: file.name,
        blobMerkleRoot: commitments.blob_merkle_root,
        numChunksets: expectedTotalChunksets(commitments.raw_data_size),
        expirationMicros: (Date.now() + 1000 * 60 * 60 * 24 * 30) * 1000,
        blobSize: commitments.raw_data_size,
      });

      const txResponse = await signAndSubmitTransaction({ data: payload });

      // Wait for confirmation
      const aptosClient = new Aptos(
        new AptosConfig({
          network: Network.SHELBYNET,
          clientConfig: {
            API_KEY: process.env.NEXT_PUBLIC_APTOS_API_KEY,
          },
        })
      );
      await aptosClient.waitForTransaction({
        transactionHash: txResponse.hash,
      });

      // STEP 3: RPC Upload
      toast.info("Step 3/3: Uploading to storage...");
      const shelbyClient = new ShelbyClient({
        network: Network.SHELBYNET,
        apiKey: process.env.NEXT_PUBLIC_SHELBY_API_KEY,
      });

      await shelbyClient.rpc.putBlob({
        account: account.address,
        blobName: file.name,
        blobData: new Uint8Array(await file.arrayBuffer()),
      });

      toast.success("Upload successful!");
    } catch (error) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        disabled={uploading || !connected}
      />
    </div>
  );
}
```

---

## 🔧 **ENVIRONMENT VARIABLES**

```env
# Aptos API Key (from geomi.dev)
NEXT_PUBLIC_APTOS_API_KEY=aptoslabs_***

# Shelby API Key (from geomi.dev)
NEXT_PUBLIC_SHELBY_API_KEY=aptoslabs_***
```

### **Get API Keys:**
1. Visit https://geomi.dev
2. Create API Resource → Select "Shelbynet"
3. Copy API key (same key works for both Aptos & Shelby)

---

## 💰 **FUNDING REQUIREMENTS**

### **Required Tokens:**
- **ShelbyUSD**: 1 ShelbyUSD per file upload
- **APT**: Gas fees for on-chain transactions

### **Get Tokens:**
- **Faucet**: https://faucet.shelbynet.shelby.xyz

---

## 🌐 **WALLET CONFIGURATION**

### **Network Settings (Petra Wallet)**
```
Network Name: Shelbynet
Node URL: https://api.shelbynet.shelby.xyz/v1
Faucet URL: https://faucet.shelbynet.shelby.xyz
Indexer URL: https://api.shelbynet.shelby.xyz/v1/graphql
```

### **WalletProvider Setup**
```typescript
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";

export function WalletProvider({ children }) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{
        network: Network.SHELBYNET,
        aptosApiKeys: {
          shelbynet: process.env.NEXT_PUBLIC_APTOS_API_KEY,
        },
      }}
      onError={(error) => console.error("Wallet error:", error)}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
```

---

## ⚠️ **CRITICAL RULES**

1. **ALWAYS** complete Step 2 (on-chain registration) before Step 3 (RPC upload)
2. **ALWAYS** use `Network.SHELBYNET` (not testnet/mainnet)
3. **ALWAYS** wait for transaction confirmation with `aptosClient.waitForTransaction()`
4. **NEVER** skip file encoding - commitments are required for registration
5. **CHECK** wallet has ShelbyUSD before upload (1 ShelbyUSD per file)

---

## 🧪 **TESTING CHECKLIST**

- [ ] Wallet connected to Shelbynet network
- [ ] Account has ShelbyUSD tokens (check balance)
- [ ] Account has APT for gas fees
- [ ] API keys configured in `.env.local`
- [ ] File encoding generates valid commitments
- [ ] On-chain transaction succeeds and confirms
- [ ] RPC upload completes without errors
- [ ] File appears in `getAccountBlobs()` list

---

## 📚 **KEY SDK REFERENCES**

### **Browser SDK Exports:**
```typescript
import {
  // Client
  ShelbyClient,
  
  // Blockchain client
  ShelbyBlobClient,
  
  // Encoding
  ClayErasureCodingProvider,
  generateCommitments,
  expectedTotalChunksets,
  
  // Types
  type BlobCommitments,
  type BlobMetadata,
} from "@shelby-protocol/sdk/browser";
```

### **Core APIs:**
- `ShelbyClient` - Main client for RPC operations
- `ShelbyBlobClient` - Blockchain operations (static methods)
- `ClayErasureCodingProvider` - File encoding provider

---

**Last Updated**: 2025-11-07  
**Based On**: [Shelby Protocol Official Docs](https://docs.shelby.xyz)  
**Network**: Shelbynet (NOT Aptos testnet/mainnet)