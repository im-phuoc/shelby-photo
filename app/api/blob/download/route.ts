import { NextRequest, NextResponse } from 'next/server';
import { AccountAddress, Network } from '@aptos-labs/ts-sdk';
import { ShelbyRPCClient } from '@shelby-protocol/sdk/browser';

const SHELBY_API_KEY = process.env.NEXT_PUBLIC_SHELBY_API_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountAddress = searchParams.get('account');
    const blobName = searchParams.get('name');

    if (!accountAddress || !blobName) {
      return NextResponse.json(
        { error: 'Missing account or blob name' },
        { status: 400 }
      );
    }

    const rpcClient = new ShelbyRPCClient({
      network: Network.SHELBYNET,
      apiKey: SHELBY_API_KEY,
    });

    // Strip the @{accountAddress}/ prefix if it exists
    const cleanBlobName = blobName.replace(/^@[^/]+\//, '');

    // Download blob
    const shelbyBlob = await rpcClient.getBlob({
      account: AccountAddress.from(accountAddress),
      blobName: cleanBlobName,
    });

    // Convert ReadableStream to Blob
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

    // Detect MIME type from filename
    const mimeType = getMimeType(blobName);

    // Return blob with proper headers
    return new NextResponse(combined, {
      headers: {
        'Content-Type': mimeType,
        'Content-Length': combined.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Blob may have been deleted or expired'
      },
      { status: 500 }
    );
  }
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    txt: 'text/plain',
    json: 'application/json',
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
}
