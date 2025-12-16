import { create } from "zustand";
import { Pool, PoolFilters, CreatePoolInput } from "@/types";
import { PoolType, PoolStatus, CONTRACT_ADDRESSES } from "@/lib/constants";
import { SIMPLE_POOL_MANAGER_ABI, USDT_ABI } from "@/lib/abis";
import { createPublicClient, createWalletClient, custom, http, parseUnits, decodeEventLog } from "viem";
import { mantleSepoliaTestnet } from "wagmi/chains";import { getPoolMetadata } from "@/lib/pool-metadata";
interface PoolStore {
  pools: Pool[];
  selectedPool: Pool | null;
  filters: PoolFilters;
  isLoading: boolean;
  isCreating: boolean;
  setSelectedPool: (pool: Pool | null) => void;
  setFilters: (filters: PoolFilters) => void;
  loadPools: () => void;
  getPoolById: (id: string) => Pool | undefined;
  getFilteredPools: () => Pool[];
  updatePoolAmount: (poolId: string, amount: number, participants: number) => void;
  createPool: (input: CreatePoolInput) => Promise<Pool>;
  getUserCreatedPools: (address: string) => Pool[];
}

export const usePoolStore = create<PoolStore>((set, get) => ({
  pools: [],
  selectedPool: null,
  filters: {},
  isLoading: false,
  isCreating: false,

  setSelectedPool: (pool) => set({ selectedPool: pool }),

  setFilters: (filters) => set({ filters }),

  loadPools: async () => {
    set({ isLoading: true });
    
    try {
      // Load pools from SimplePoolManager contract
      const publicClient = createPublicClient({
        chain: mantleSepoliaTestnet,
        transport: http("https://rpc.sepolia.mantle.xyz"),
      });

      // Get pool count
      const poolCount = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.POOL_MANAGER as `0x${string}`,
        abi: SIMPLE_POOL_MANAGER_ABI,
        functionName: 'poolCount',
      }) as bigint;

      const loadedPools: Pool[] = [];
      
      // Load each pool
      for (let i = 1; i <= Number(poolCount); i++) {
        try {
          const poolData = await publicClient.readContract({
            address: CONTRACT_ADDRESSES.POOL_MANAGER as `0x${string}`,
            abi: SIMPLE_POOL_MANAGER_ABI,
            functionName: 'getPool',
            args: [BigInt(i)],
          }) as any;

          // Convert blockchain data to Pool interface
          // Get metadata if available, otherwise use defaults
          const metadata = getPoolMetadata(i.toString());
          const poolDeadline = new Date(Number(poolData.deadline) * 1000);
          
          let eventDate: Date;
          let venue: string;
          let description: string;
          let category: string;
          
          if (metadata) {
            eventDate = new Date(metadata.event.date);
            venue = metadata.event.venue;
            description = metadata.event.description;
            category = metadata.event.category;
          } else {
            // Fallback defaults if no metadata
            const estimatedEventDate = new Date(poolDeadline);
            estimatedEventDate.setDate(estimatedEventDate.getDate() + 30);
            eventDate = estimatedEventDate;
            venue = 'Venue TBA';
            description = 'Event details will be shared after pool closes';
            category = poolData.poolType === 0 ? 'Entertainment' : 'Event';
          }
          
          const pool: Pool = {
            id: i.toString(),
            eventId: `event-${i}`,
            event: {
              id: `event-${i}`,
              name: poolData.eventName,
              description,
              date: eventDate,
              venue,
              ticketPrice: Number(poolData.ticketPrice) / 1e6,
              category,
            },
            type: poolData.poolType === 0 ? PoolType.LUCKY_DRAW : PoolType.COMMIT_TO_CLAIM,
            status: poolData.status === 0 ? PoolStatus.ACTIVE : 
                   poolData.status === 1 ? PoolStatus.COMPLETED : PoolStatus.CANCELLED,
            targetAmount: Number(poolData.ticketPrice) / 1e6,
            currentAmount: Number(poolData.totalPooled) / 1e6,
            maxParticipants: Number(poolData.maxParticipants),
            currentParticipants: poolData.participants.length,
            entryAmount: Number(poolData.entryAmount) / 1e6,
            deadline: poolDeadline,
            createdAt: new Date(),
            ticketsReserved: 1,
            winnerCount: 1,
            creatorAddress: poolData.creator,
            isUserCreated: true,
            contractAddress: CONTRACT_ADDRESSES.POOL_MANAGER,
          };

          loadedPools.push(pool);
        } catch (error) {
          console.error(`Error loading pool ${i}:`, error);
        }
      }

      set({ pools: loadedPools, isLoading: false });
    } catch (error) {
      console.error('Error loading pools:', error);
      set({ pools: [], isLoading: false });
    }
  },

  getPoolById: (id: string) => {
    return get().pools.find((pool) => pool.id === id);
  },

  getFilteredPools: () => {
    const { pools, filters } = get();
    
    return pools.filter((pool) => {
      if (filters.type && pool.type !== filters.type) return false;
      if (filters.status && pool.status !== filters.status) return false;
      if (filters.category && pool.event.category !== filters.category) return false;
      if (filters.minAmount && pool.entryAmount < filters.minAmount) return false;
      if (filters.maxAmount && pool.entryAmount > filters.maxAmount) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          pool.event.name.toLowerCase().includes(searchLower) ||
          pool.event.venue.toLowerCase().includes(searchLower) ||
          pool.event.category.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  },

  updatePoolAmount: (poolId, amount, participants) =>
    set((state) => ({
      pools: state.pools.map((pool) =>
        pool.id === poolId
          ? {
              ...pool,
              currentAmount: amount,
              currentParticipants: participants,
            }
          : pool
      ),
    })),

  createPool: async (input: CreatePoolInput): Promise<Pool> => {
    set({ isCreating: true });
    
    try {
      const isCommitToClaim = input.poolType === PoolType.COMMIT_TO_CLAIM;
      
      // Get wallet client
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error("Wallet not connected");
      }

      const walletClient = createWalletClient({
        chain: mantleSepoliaTestnet,
        transport: custom((window as any).ethereum),
      });

      const [account] = await walletClient.getAddresses();
      if (!account) {
        throw new Error("No account connected");
      }

      // Calculate deadline timestamp
      const deadlineTimestamp = Math.floor(Date.now() / 1000) + (input.daysUntilDeadline * 86400);
      
      // Convert amounts to USDT units (6 decimals)
      const ticketPriceInUSDT = parseUnits(input.ticketPrice.toString(), 6);
      const entryAmountInUSDT = parseUnits(input.entryAmount.toString(), 6);
      
      // Call SimplePoolManager.createPool
      // function createPool(PoolType poolType, string eventName, uint256 entryAmount, uint256 ticketPrice, uint256 maxParticipants, uint256 deadline)
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESSES.POOL_MANAGER as `0x${string}`,
        abi: SIMPLE_POOL_MANAGER_ABI,
        functionName: 'createPool',
        args: [
          isCommitToClaim ? 1 : 0, // PoolType: 0=LuckyDraw, 1=CommitToClaim
          input.eventName,
          entryAmountInUSDT,
          ticketPriceInUSDT,
          BigInt(input.maxParticipants),
          BigInt(deadlineTimestamp),
        ],
        account,
      });

      // Wait for transaction confirmation
      const publicClient = createPublicClient({
        chain: mantleSepoliaTestnet,
        transport: http(),
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      if (receipt.status !== 'success') {
        throw new Error("Transaction failed");
      }

      // Parse logs to get the pool ID from PoolCreated event using viem's decodeEventLog
      const poolCreatedEvent = receipt.logs.find(log => {
        try {
          const decoded = decodeEventLog({
            abi: SIMPLE_POOL_MANAGER_ABI,
            data: log.data,
            topics: log.topics,
          });
          return decoded.eventName === 'PoolCreated';
        } catch {
          return false;
        }
      });

      if (!poolCreatedEvent) {
        throw new Error("Could not find PoolCreated event in transaction logs");
      }

      // Decode the event to get pool ID
      const decodedEvent = decodeEventLog({
        abi: SIMPLE_POOL_MANAGER_ABI,
        data: poolCreatedEvent.data,
        topics: poolCreatedEvent.topics,
      });

      const poolId = (decodedEvent.args as any).poolId.toString();
      
      // Create the event object
      const event = {
        id: `event-${Date.now()}`,
        name: input.eventName,
        description: input.eventDescription || "",
        date: input.eventDate,
        venue: input.eventVenue,
        ticketPrice: input.ticketPrice,
        category: input.eventCategory,
      };

      // Calculate deadlines
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + input.daysUntilDeadline);
      
      const paymentDeadline = new Date(input.eventDate);
      paymentDeadline.setDate(paymentDeadline.getDate() - 30); // 30 days before event

      // Create the new pool
      const newPool: Pool = {
        id: poolId,
        eventId: event.id,
        event,
        type: input.poolType,
        status: PoolStatus.ACTIVE,
        targetAmount: input.ticketPrice * input.winnerCount,
        currentAmount: 0,
        maxParticipants: isCommitToClaim ? 1 : input.maxParticipants,
        currentParticipants: 0,
        entryAmount: input.entryAmount,
        commitmentAmount: isCommitToClaim ? input.entryAmount : undefined,
        deadline,
        paymentDeadline: isCommitToClaim ? paymentDeadline : undefined,
        createdAt: new Date(),
        ticketsReserved: input.winnerCount,
        winnerCount: input.winnerCount,
        // Creator fields
        creatorAddress: account,
        isUserCreated: true,
        ticketOwnerAddress: isCommitToClaim ? account : undefined,
        contractAddress: CONTRACT_ADDRESSES.POOL_MANAGER, // All pools are in SimplePoolManager
      };

      set((state) => ({
        pools: [newPool, ...state.pools],
        isCreating: false,
      }));

      return newPool;
    } catch (error) {
      console.error('Error creating pool:', error);
      set({ isCreating: false });
      throw error;
    }
  },

  getUserCreatedPools: (address: string): Pool[] => {
    return get().pools.filter(
      (pool) => pool.creatorAddress?.toLowerCase() === address.toLowerCase()
    );
  },
}));
