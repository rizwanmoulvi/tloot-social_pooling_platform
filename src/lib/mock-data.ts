import { Pool, Event, User, UserParticipation } from "@/types";
import { PoolType, PoolStatus, ParticipationStatus } from "./constants";

// Mock Events
export const mockEvents: Event[] = [
  {
    id: "1",
    name: "Taylor Swift | The Eras Tour",
    description: "The biggest concert tour of the decade",
    date: new Date("2026-06-15"),
    venue: "MetLife Stadium, NJ",
    ticketPrice: 450,
    category: "Music",
  },
  {
    id: "2",
    name: "NBA Finals Game 7",
    description: "Championship deciding game",
    date: new Date("2026-06-20"),
    venue: "Chase Center, SF",
    ticketPrice: 850,
    category: "Sports",
  },
  {
    id: "3",
    name: "Coachella 2026",
    description: "Music and arts festival",
    date: new Date("2026-04-10"),
    venue: "Indio, California",
    ticketPrice: 599,
    category: "Festival",
  },
  {
    id: "4",
    name: "Super Bowl LXI",
    description: "NFL Championship Game",
    date: new Date("2027-02-07"),
    venue: "SoFi Stadium, LA",
    ticketPrice: 1200,
    category: "Sports",
  },
  {
    id: "5",
    name: "BTS World Tour",
    description: "K-pop legends return",
    date: new Date("2026-08-22"),
    venue: "Madison Square Garden, NYC",
    ticketPrice: 350,
    category: "Music",
  },
  {
    id: "6",
    name: "F1 Monaco Grand Prix",
    description: "The jewel in F1's crown",
    date: new Date("2026-05-24"),
    venue: "Circuit de Monaco",
    ticketPrice: 2500,
    category: "Sports",
  },
];

// Mock Pools
export const mockPools: Pool[] = [
  {
    id: "1",
    eventId: "1",
    event: mockEvents[0],
    type: PoolType.LUCKY_DRAW,
    status: PoolStatus.ACTIVE,
    targetAmount: 450,
    currentAmount: 315,
    maxParticipants: 30,
    currentParticipants: 21,
    entryAmount: 15,
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    createdAt: new Date("2026-01-10"),
    ticketsReserved: 1,
  },
  {
    id: "2",
    eventId: "2",
    event: mockEvents[1],
    type: PoolType.COMMIT_TO_CLAIM,
    status: PoolStatus.FILLING,
    targetAmount: 850,
    currentAmount: 680,
    maxParticipants: 10,
    currentParticipants: 8,
    entryAmount: 85,
    commitmentAmount: 85,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    paymentDeadline: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000), // 37 days
    createdAt: new Date("2026-01-08"),
    ticketsReserved: 1,
  },
  {
    id: "3",
    eventId: "3",
    event: mockEvents[2],
    type: PoolType.LUCKY_DRAW,
    status: PoolStatus.ACTIVE,
    targetAmount: 599,
    currentAmount: 480,
    maxParticipants: 40,
    currentParticipants: 32,
    entryAmount: 15,
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
    createdAt: new Date("2026-01-09"),
    ticketsReserved: 1,
  },
  {
    id: "4",
    eventId: "4",
    event: mockEvents[3],
    type: PoolType.COMMIT_TO_CLAIM,
    status: PoolStatus.ACTIVE,
    targetAmount: 1200,
    currentAmount: 360,
    maxParticipants: 8,
    currentParticipants: 3,
    entryAmount: 150,
    commitmentAmount: 150,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    paymentDeadline: new Date(Date.now() + 44 * 24 * 60 * 60 * 1000), // 44 days
    createdAt: new Date("2026-01-12"),
    ticketsReserved: 1,
  },
  {
    id: "5",
    eventId: "5",
    event: mockEvents[4],
    type: PoolType.LUCKY_DRAW,
    status: PoolStatus.COMPLETED,
    targetAmount: 350,
    currentAmount: 350,
    maxParticipants: 25,
    currentParticipants: 25,
    entryAmount: 14,
    deadline: new Date("2026-01-13"),
    createdAt: new Date("2026-01-05"),
    ticketsReserved: 1,
    winners: ["0x742d35Cc6074C4532895c05b22629ce5b3c28da4"],
  },
  {
    id: "6",
    eventId: "6",
    event: mockEvents[5],
    type: PoolType.COMMIT_TO_CLAIM,
    status: PoolStatus.ACTIVE,
    targetAmount: 2500,
    currentAmount: 1250,
    maxParticipants: 5,
    currentParticipants: 2,
    entryAmount: 500,
    commitmentAmount: 500,
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
    paymentDeadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), // 40 days
    createdAt: new Date("2026-01-11"),
    ticketsReserved: 1,
  },
];

// Mock User
export const mockUser: User = {
  address: "0x742d35Cc6074C4532895c05b22629ce5b3c28da4",
  xp: 450,
  level: 5,
  reputation: 85,
  tokenBalance: 1250,
  poolsJoined: 12,
  poolsWon: 3,
  participations: [],
  createdAt: new Date("2025-12-01"),
};

// Mock User Participations
export const mockUserParticipations: UserParticipation[] = [
  {
    id: "1",
    poolId: "1",
    pool: mockPools[0],
    userId: mockUser.address,
    status: ParticipationStatus.JOINED,
    amountContributed: 15,
    entries: 1,
    joinedAt: new Date("2026-01-12"),
    tokenRewards: 0,
  },
  {
    id: "2",
    poolId: "5",
    pool: mockPools[4],
    userId: mockUser.address,
    status: ParticipationStatus.WON,
    amountContributed: 14,
    entries: 1,
    joinedAt: new Date("2026-01-06"),
    wonAt: new Date("2026-01-13"),
    tokenRewards: 100,
  },
];

export function getMockPoolById(id: string): Pool | undefined {
  return mockPools.find((pool) => pool.id === id);
}

export function getMockEventById(id: string): Event | undefined {
  return mockEvents.find((event) => event.id === id);
}

export function getMockPoolsByType(type: PoolType): Pool[] {
  return mockPools.filter((pool) => pool.type === type);
}

export function getMockActivePoolsFeed(): Pool[] {
  return mockPools.filter((pool) => 
    pool.status === PoolStatus.ACTIVE || pool.status === PoolStatus.FILLING
  );
}
