"use client";

import React, { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { config, queryClient } from "@/lib/web3";
import "@rainbow-me/rainbowkit/styles.css";

export function Web3Provider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {mounted && (
          <RainbowKitProvider
            theme={lightTheme({
              accentColor: "#000000",
              accentColorForeground: "white",
              borderRadius: "none",
              fontStack: "system",
            })}
          >
            {children}
          </RainbowKitProvider>
        )}
        {!mounted && children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
