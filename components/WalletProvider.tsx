"use client";

import {
  AptosWalletAdapterProvider,
  DappConfig,
} from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren } from "react";
import { Network } from "@aptos-labs/ts-sdk";
import { useClaimSecretKey } from "@/hooks/useClaimSecretKey";
import { useAutoConnect } from "@/components/AutoConnectProvider";
import { useToast } from "@/components/ui/use-toast";
import { useTransactionSubmitter } from "@/components/TransactionSubmitterProvider";

let dappImageURI: string | undefined;
if (typeof window !== "undefined") {
  dappImageURI = `${window.location.origin}${window.location.pathname}favicon.ico`;
}

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const { autoConnect } = useAutoConnect();
  const { toast } = useToast();
  const { useCustomSubmitter } = useTransactionSubmitter();

  // Enables claim flow when the `claim` query param is detected
  const claimSecretKey = useClaimSecretKey();

  const dappConfig: DappConfig = {
    // Shelbynet runs on Aptos Testnet infrastructure
    // The smart contracts are deployed on Testnet at 0x73eb...
    network: Network.TESTNET,
    aptosApiKeys: {
      // Optional: Add API keys if you want to interact with Testnet/Devnet
      // For Shelby only, these are not required
      testnet: process.env.NEXT_PUBLIC_APTOS_API_KEY_TESTNET,
      devnet: process.env.NEXT_PUBLIC_APTOS_API_KEY_DEVNET,
    },
    aptosConnect: {
      claimSecretKey,
      dappId: "57fa42a9-29c6-4f1e-939c-4eefa36d9ff5",
      dappImageURI,
    },
    // Disable ANS (Aptos Name Service) to avoid 401 errors when no API key
    mizuwallet: {
      manifestURL:
        "https://assets.mz.xyz/static/config/mizuwallet-connect-manifest.json",
    },
  };

  return (
    <AptosWalletAdapterProvider
      key={useCustomSubmitter ? "custom" : "default"}
      autoConnect={autoConnect}
      dappConfig={dappConfig}
      onError={(error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error || "Unknown wallet error",
        });
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};