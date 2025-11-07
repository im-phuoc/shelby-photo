"use client";

import { useEffect, useState } from "react";

/**
 * Hook to handle Aptos Connect claim flow
 * Detects the `claim` query parameter and returns the secret key
 */
export function useClaimSecretKey(): string | undefined {
  const [claimSecretKey, setClaimSecretKey] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const claim = searchParams.get("claim");
      
      if (claim) {
        setClaimSecretKey(claim);
      }
    } catch (error) {
      console.error("Failed to parse claim secret key:", error);
    }
  }, []);

  return claimSecretKey;
}
