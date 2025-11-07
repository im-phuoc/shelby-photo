import {
  AccountAuthenticator,
  AnyRawTransaction,
  Aptos,
  AptosConfig,
  PendingTransactionResponse,
} from "@aptos-labs/ts-sdk";

/**
 * Custom transaction submitter for Aptos
 * Allows for custom transaction handling and submission logic
 */
export const myTransactionSubmitter = async (
  transaction: AnyRawTransaction,
  senderAuthenticator: AccountAuthenticator,
  aptos: Aptos,
  aptosConfig: AptosConfig
): Promise<PendingTransactionResponse> => {
  // You can add custom logic here before submitting
  console.log("Submitting transaction with custom submitter");

  // Submit the transaction using the Aptos SDK
  const response = await aptos.transaction.submit.simple({
    transaction,
    senderAuthenticator,
  });

  console.log("Transaction submitted:", response.hash);

  return response;
};
