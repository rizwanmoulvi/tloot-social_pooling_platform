import { PoolType, PoolStatus, ParticipationStatus } from "@/lib/constants";

export interface Event {
  id: string;
  name: string;
  description: string;
  date: Date;
  venue: string;
  ticketPrice: number;
  category: string;
}

export interface Pool {
  id: string;
  eventId: string;
  event: Event;
  type: PoolType;
  status: PoolStatus;
  targetAmount: number;
  currentAmount: number;
  maxParticipants: number;
  currentParticipants: number;
  entryAmount: number;
  commitmentAmount?: number; // For Commit-to-Claim
  deadline: Date;
  paymentDeadline?: Date; // For Commit-to-Claim
  createdAt: Date;
  ticketsReserved: number;
  winners?: string[]; // Addresses of winners
  winnerCount?: number; // Number of winners for Lucky Draw
  // Creator information
  creatorAddress?: string; // Wallet address of pool creator
  isUserCreated?: boolean; // Whether this pool was created by a user (vs platform)
  ticketOwnerAddress?: string; // For Commit-to-Claim: who is responsible for the ticket
  contractAddress?: string; // Address of the individual pool contract
}

export interface UserParticipation {
  id: string;
  poolId: string;
  pool: Pool;
  userId: string;
  status: ParticipationStatus;
  amountContributed: number;
  entries: number; // For Lucky Draw
  joinedAt: Date;
  wonAt?: Date;
  claimedAt?: Date;
  tokenRewards: number;
}

export interface User {
  address: string;
  xp: number;
  level: number;
  reputation: number;
  tokenBalance: number;
  poolsJoined: number;
  poolsWon: number;
  participations: UserParticipation[];
  createdAt: Date;
}

export interface TokenReward {
  id: string;
  userId: string;
  amount: number;
  source: "PARTICIPATION" | "YIELD" | "CLAIM_FEE" | "SLASHED_COMMITMENT";
  poolId?: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  hash: string;
  type: "JOIN_POOL" | "CLAIM_TICKET" | "COMPLETE_PAYMENT" | "TOKEN_REWARD";
  status: "PENDING" | "SUCCESS" | "FAILED";
  amount: number;
  poolId?: string;
  createdAt: Date;
}

export interface PoolFilters {
  type?: PoolType;
  status?: PoolStatus;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

// Input for creating a new pool
export interface CreatePoolInput {
  // Event details
  eventName: string;
  eventDescription?: string;
  eventVenue: string;
  eventDate: Date;
  eventCategory: string;
  ticketPrice: number;
  // Pool settings
  poolType: PoolType;
  entryAmount: number;
  maxParticipants: number;
  winnerCount: number;
  daysUntilDeadline: number;
  // Creator info
  creatorAddress: string;
}
