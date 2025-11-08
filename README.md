# Shelby Photo

A decentralized photo storage application built with Next.js, Aptos blockchain, and Shelby Protocol.

## Features

- 🔐 **Wallet Integration** - Connect with Aptos-compatible wallets (Petra, Martian, etc.)
- 📸 **Photo Upload** - Upload photos to decentralized storage with Clay Erasure Coding
- 🖼️ **Gallery** - View and download your uploaded photos
- ⛓️ **Blockchain-Backed** - Metadata stored on Aptos blockchain (Shelbynet)
- 🎨 **Modern UI** - Clean, responsive design with dark mode support

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Blockchain**: Aptos TS SDK, Wallet Adapter
- **Storage**: Shelby Protocol SDK (Clay Erasure Coding)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Lucide Icons

## Getting Started

### Prerequisites

- Node.js 20+ and pnpm
- Aptos wallet (Petra recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/im-phuoc/shelby-photo.git
cd shelby-photo
```

2. Install dependencies:
```bash
pnpm install
```

3. Create `.env.local` file:
```bash
# App URL (use your production domain when deploying)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Required: Shelby API Key
NEXT_PUBLIC_SHELBY_API_KEY=your-api-key-here

# Optional: Shelby RPC URL (defaults to mainnet)
NEXT_PUBLIC_SHELBY_RPC_URL=https://api.shelbynet.shelby.xyz/shelby
```

Get your Shelby API key from [https://geomi.dev](https://geomi.dev) → Create API Resource → Network: Shelbynet

4. Run development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
pnpm build
pnpm start
```

## How It Works

1. **Client-Side Encoding** - Files are encoded with Clay Erasure Coding locally
2. **Blockchain Registration** - Blob metadata is registered on Aptos blockchain (costs ~1 ShelbyUSD)
3. **Decentralized Upload** - Encoded data is uploaded to Shelby storage network
4. **Gallery Access** - View and download your photos anytime

Photos are stored for 24 hours by default.

## Architecture

- **Shelbynet** runs on Aptos Testnet infrastructure (Chain ID: 4543)
- **Smart Contracts** deployed at `0x73eb...` on Aptos Testnet
- **Storage Layer** managed by Shelby Protocol's decentralized network
- **CORS Proxy** via Next.js API routes for secure blob downloads

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Yes (Production) | Your app's production URL for OG images |
| `NEXT_PUBLIC_SHELBY_API_KEY` | Yes | API key for Shelby Protocol |
| `NEXT_PUBLIC_SHELBY_RPC_URL` | No | RPC endpoint (defaults to Shelbynet) |

## Deployment

### Vercel (Recommended)

1. Import repository to Vercel
2. Add environment variables in project settings:
   - `NEXT_PUBLIC_APP_URL` - Your Vercel domain (e.g., `https://shelby-photo.vercel.app`)
   - `NEXT_PUBLIC_SHELBY_API_KEY` - Your Shelby API key
3. Deploy!

### Other Platforms

Ensure Node.js 20+ is available and set environment variables before deployment.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Links

- [Shelby Protocol](https://shelby.xyz)
- [Aptos Network](https://aptos.dev)
- [Documentation](https://docs.shelby.xyz)

---

Built with ❤️ using Shelby Protocol on Aptos

