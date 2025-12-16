// Pool metadata - stores additional event details not stored on blockchain
// This allows us to have full event information while keeping the smart contract simple

export interface PoolMetadata {
  poolId: string;
  event: {
    description: string;
    venue: string;
    date: string; // ISO date string
    category: string;
  };
}

// Add metadata for your pools here
export const POOL_METADATA: Record<string, PoolMetadata> = {
  "2": {
    poolId: "2",
    event: {
      description: "Experience the Eras Tour live! Join this pool to get a chance at Taylor Swift concert tickets.",
      venue: "SoFi Stadium, Los Angeles",
      date: "2026-08-15T19:00:00Z", // August 15, 2026, 7 PM
      category: "Concert",
    },
  },
  // Add more pools as needed
  // "3": {
  //   poolId: "3",
  //   event: {
  //     description: "...",
  //     venue: "...",
  //     date: "2026-09-20T18:00:00Z",
  //     category: "Sports",
  //   },
  // },
};

export function getPoolMetadata(poolId: string): PoolMetadata | null {
  return POOL_METADATA[poolId] || null;
}
