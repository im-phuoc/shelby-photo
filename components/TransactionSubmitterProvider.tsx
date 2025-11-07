"use client";

import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useState,
} from "react";

export interface TransactionSubmitterContextState {
  useCustomSubmitter: boolean;
  setUseCustomSubmitter: (useCustomSubmitter: boolean) => void;
}

export const TransactionSubmitterContext =
  createContext<TransactionSubmitterContextState>(
    {} as TransactionSubmitterContextState
  );

export function useTransactionSubmitter(): TransactionSubmitterContextState {
  return useContext(TransactionSubmitterContext);
}

export const TransactionSubmitterProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [useCustomSubmitter, setUseCustomSubmitter] = useState(false);

  return (
    <TransactionSubmitterContext.Provider
      value={{ useCustomSubmitter, setUseCustomSubmitter }}
    >
      {children}
    </TransactionSubmitterContext.Provider>
  );
};
