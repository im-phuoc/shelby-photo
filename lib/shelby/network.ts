/**
 * Shelbynet Network Configuration
 * Helper functions to add Shelbynet to Aptos wallets
 */

// Extend Window interface for wallet
declare global {
  interface Window {
    aptos?: any;
  }
}

export const SHELBYNET_CONFIG = {
  name: "Shelbynet",
  chainId: 4543, // Shelbynet chain ID
  // Shelbynet is built on Aptos Testnet infrastructure
  url: "https://api.testnet.aptoslabs.com/v1",
  shelbyRPC: "https://api.shelbynet.shelby.xyz/shelby", // Shelby's own RPC for storage
  faucetUrl: "https://faucet.shelbynet.shelby.xyz",
  explorerUrl: "https://explorer.aptoslabs.com/?network=shelbynet",
};

/**
 * Request wallet to add Shelbynet network
 * Works with wallets that support network switching (e.g., Petra)
 */
export async function addShelbynetToWallet(): Promise<boolean> {
  try {
    // Check if wallet supports network management
    if (typeof window === "undefined" || !window.aptos) {
      console.warn("Wallet not found");
      return false;
    }

    const wallet = (window as any).aptos;

    // Try Petra wallet API
    if (wallet.addNetwork) {
      await wallet.addNetwork({
        name: SHELBYNET_CONFIG.name,
        chainId: SHELBYNET_CONFIG.chainId,
        url: SHELBYNET_CONFIG.url,
      });
      console.log("✅ Shelbynet added to wallet");
      return true;
    }

    // Try switching network
    if (wallet.changeNetwork) {
      await wallet.changeNetwork({
        name: SHELBYNET_CONFIG.name,
        chainId: SHELBYNET_CONFIG.chainId,
        url: SHELBYNET_CONFIG.url,
      });
      console.log("✅ Switched to Shelbynet");
      return true;
    }

    console.warn("Wallet does not support network management");
    return false;
  } catch (error) {
    console.error("Failed to add Shelbynet to wallet:", error);
    return false;
  }
}

/**
 * Check if wallet is currently on Shelbynet
 */
export async function isOnShelbynet(): Promise<boolean> {
  try {
    if (typeof window === "undefined" || !window.aptos) {
      return false;
    }

    const wallet = (window as any).aptos;

    // Try to get current network
    if (wallet.network) {
      const network = await wallet.network();
      return (
        network?.chainId === SHELBYNET_CONFIG.chainId ||
        network?.name?.toLowerCase().includes("shelby")
      );
    }

    return false;
  } catch (error) {
    console.error("Failed to check network:", error);
    return false;
  }
}

/**
 * Prompt user to switch to Shelbynet
 */
export async function ensureShelbynet(): Promise<void> {
  const onShelbynet = await isOnShelbynet();

  if (!onShelbynet) {
    const added = await addShelbynetToWallet();

    if (!added) {
      throw new Error(
        `Please manually switch your wallet to Shelbynet.\n\n` +
          `Network details:\n` +
          `- Name: ${SHELBYNET_CONFIG.name}\n` +
          `- Chain ID: ${SHELBYNET_CONFIG.chainId}\n` +
          `- RPC URL: ${SHELBYNET_CONFIG.url}`
      );
    }
  }
}
