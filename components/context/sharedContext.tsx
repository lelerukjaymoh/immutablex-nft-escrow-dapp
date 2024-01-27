"use client";

import { Signer, BrowserProvider } from "ethers";
import { createContext, useContext, useState } from "react";

interface SharedContext {
  evmProvider: BrowserProvider | null;
  evmSigner: Signer | null;

  setEvmProvider(provider: BrowserProvider): void;
  setEvmSigner(signer: Signer): void;
}

const SharedContext = createContext<SharedContext>({
  evmProvider: null,
  evmSigner: null,

  setEvmProvider: (provider: BrowserProvider) => {},
  setEvmSigner: (signer: Signer) => {},
});

type Props = {
  children: any;
};

export const SharedProvider = ({ children }: Props) => {
  const [evmProvider, setEvmProvider] = useState<BrowserProvider | null>(null);
  const [evmSigner, setEvmSigner] = useState<Signer | null>(null);

  return (
    <SharedContext.Provider
      value={{ evmProvider, evmSigner, setEvmProvider, setEvmSigner }}
    >
      {children}
    </SharedContext.Provider>
  );
};

export function useSharedContext() {
  return useContext(SharedContext);
}
