import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    // Get the logo URL from the request
    const { origin } = new URL(request.url);
    const logoUrl = `${origin}/logo.png`;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            backgroundImage: 'linear-gradient(to bottom right, #ffffff, #f8f9fa)',
          }}
        >
          {/* Logo */}
          <img
            src={logoUrl}
            alt="Shelby Logo"
            width={120}
            height={120}
            style={{
              marginBottom: 40,
            }}
          />

          {/* Title */}
          <div
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              color: '#ff77c9',
              marginBottom: 20,
            }}
          >
            Shelby Photo
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 32,
              color: '#6b7280',
              textAlign: 'center',
              maxWidth: 800,
            }}
          >
            Decentralized Photo Storage on Aptos Blockchain
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              fontSize: 20,
              color: '#9ca3af',
            }}
          >
            <span>Built by Dmitri | MegaNode</span>
            <span>•</span>
            <span>Powered by Shelby Protocol on Aptos</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    // Fallback response without logo
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            backgroundImage: 'linear-gradient(to bottom right, #ffffff, #f8f9fa)',
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              color: '#ff77c9',
              marginBottom: 20,
            }}
          >
            Shelby Photo
          </div>
          <div
            style={{
              fontSize: 32,
              color: '#6b7280',
              textAlign: 'center',
              maxWidth: 800,
            }}
          >
            Decentralized Photo Storage on Aptos Blockchain
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  }
}
