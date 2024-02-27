"use client";

import { Signer, BrowserProvider } from "ethers";
import { createContext, useContext, useState } from "react";

interface SharedContext {
  evmProvider: BrowserProvider | null;
  evmSigner: Signer | null;
  accountAddress: string;

  setEvmProvider(provider: BrowserProvider): void;
  setEvmSigner(signer: Signer): void;
  setAccountAddress(address: string): void;
}

const SharedContext = createContext<SharedContext>({
  evmProvider: null,
  evmSigner: null,
  accountAddress: "",

  setEvmProvider: (provider: BrowserProvider) => {},
  setEvmSigner: (signer: Signer) => {},
  setAccountAddress: (address: string) => {},
});

type Props = {
  children: any;
};

export const SharedProvider = ({ children }: Props) => {
  const [evmProvider, setEvmProvider] = useState<BrowserProvider | null>(null);
  const [evmSigner, setEvmSigner] = useState<Signer | null>(null);
  const [accountAddress, setAccountAddress] = useState<string>("");

  return (
    <SharedContext.Provider
      value={{
        evmProvider,
        evmSigner,
        accountAddress,
        setEvmProvider,
        setEvmSigner,
        setAccountAddress,
      }}
    >
      {children}
    </SharedContext.Provider>
  );
};

export function useSharedContext() {
  return useContext(SharedContext);
}
