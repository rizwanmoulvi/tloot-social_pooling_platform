import { http, createConfig } from "wagmi";
import { MANTLE_TESTNET, CONTRACT_ADDRESSES } from "./constants";
import { SIMPLE_POOL_MANAGER_ABI, USDT_ABI } from "./abis";
import { QueryClient } from "@tanstack/react-query";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet, rainbowWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";

// Define the chain configuration
const mantleSepoliaChain = {
  id: 5003,
  name: "Mantle Sepolia Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Mantle",
    symbol: "MNT",
  },
  rpcUrls: {
    default: { http: ["https://rpc.sepolia.mantle.xyz"] },
  },
  blockExplorers: {
    default: { name: "Mantle Testnet Explorer", url: "https://sepolia.mantlescan.xyz" },
  },
  testnet: true,
} as const;

// Create connectors with WalletConnect project ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, rainbowWallet, walletConnectWallet],
    },
  ],
  {
    appName: "TLOOT",
    projectId,
  }
);

// Wagmi Configuration
export const config = createConfig({
  chains: [mantleSepoliaChain],
  connectors,
  transports: {
    [mantleSepoliaChain.id]: http("https://rpc.sepolia.mantle.xyz"),
  },
  ssr: true, // Enable SSR mode
});

// Query Client for React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});

// Note: Pool Manager ABI is now imported from abis.ts as SIMPLE_POOL_MANAGER_ABI
// This includes all functions for creating pools, joining, and managing TLOOT tokens

// Helper function to get contract config
export function getPoolManagerContract() {
  return {
    address: CONTRACT_ADDRESSES.POOL_MANAGER as `0x${string}`,
    abi: SIMPLE_POOL_MANAGER_ABI,
  };
}

export function getTokenContract() {
  // Token is built into Pool Manager (same contract)
  return {
    address: CONTRACT_ADDRESSES.TOKEN as `0x${string}`,
    abi: SIMPLE_POOL_MANAGER_ABI,
  };
}

export function getUSDTContract() {
  return {
    address: CONTRACT_ADDRESSES.USDT as `0x${string}`,
    abi: USDT_ABI,
  };
}