// SimplePoolManager ABI (unified contract with built-in TLOOT)
export const SIMPLE_POOL_MANAGER_ABI = [
  {
    "inputs": [
      { "internalType": "enum SimplePoolManager.PoolType", "name": "poolType", "type": "uint8" },
      { "internalType": "string", "name": "eventName", "type": "string" },
      { "internalType": "uint256", "name": "entryAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "ticketPrice", "type": "uint256" },
      { "internalType": "uint256", "name": "maxParticipants", "type": "uint256" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" }
    ],
    "name": "createPool",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "poolId", "type": "uint256" }
    ],
    "name": "joinPool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "poolId", "type": "uint256" }
    ],
    "name": "completePayment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "poolCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "poolId", "type": "uint256" }],
    "name": "getPool",
    "outputs": [
      {
        "internalType": "struct SimplePoolManager.Pool",
        "name": "",
        "type": "tuple",
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "enum SimplePoolManager.PoolType", "name": "poolType", "type": "uint8" },
          { "internalType": "enum SimplePoolManager.PoolStatus", "name": "status", "type": "uint8" },
          { "internalType": "address", "name": "creator", "type": "address" },
          { "internalType": "string", "name": "eventName", "type": "string" },
          { "internalType": "uint256", "name": "entryAmount", "type": "uint256" },
          { "internalType": "uint256", "name": "ticketPrice", "type": "uint256" },
          { "internalType": "uint256", "name": "maxParticipants", "type": "uint256" },
          { "internalType": "uint256", "name": "deadline", "type": "uint256" },
          { "internalType": "uint256", "name": "totalPooled", "type": "uint256" },
          { "internalType": "address", "name": "winner", "type": "address" },
          { "internalType": "address[]", "name": "participants", "type": "address[]" }
        ]
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "poolId", "type": "uint256" }],
    "name": "getParticipants",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "poolId", "type": "uint256" }],
    "name": "getParticipantCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "poolCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "poolId", "type": "uint256" },
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "hasJoined",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "poolId", "type": "uint256" },
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "hasCompletedPayment",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "poolId", "type": "uint256" },
      { "indexed": false, "internalType": "enum SimplePoolManager.PoolType", "name": "poolType", "type": "uint8" },
      { "indexed": false, "internalType": "address", "name": "creator", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "eventName", "type": "string" }
    ],
    "name": "PoolCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "poolId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "tlootMinted", "type": "uint256" }
    ],
    "name": "UserJoined",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "poolId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "remainingAmount", "type": "uint256" }
    ],
    "name": "PaymentCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "poolId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "winner", "type": "address" }
    ],
    "name": "WinnerSelected",
    "type": "event"
  }
] as const;

// USDT Token ABI (ERC20)
export const USDT_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Lucky Draw Factory ABI (DEPRECATED - keeping for backward compatibility)
export const LUCKY_DRAW_FACTORY_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "creator", "type": "address" },
      { "internalType": "string", "name": "eventName", "type": "string" },
      { "internalType": "uint256", "name": "eventDate", "type": "uint256" },
      { "internalType": "uint256", "name": "ticketPrice", "type": "uint256" },
      { "internalType": "uint256", "name": "entryAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "maxParticipants", "type": "uint256" },
      { "internalType": "uint256", "name": "poolDeadline", "type": "uint256" }
    ],
    "name": "createPool",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllPools",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getUserCreatedPools",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPoolCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "poolAddress", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "eventName", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "ticketPrice", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "entryAmount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "maxParticipants", "type": "uint256" }
    ],
    "name": "PoolCreated",
    "type": "event"
  }
] as const;

// Commit to Claim Factory ABI
export const COMMIT_TO_CLAIM_FACTORY_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "creator", "type": "address" },
      { "internalType": "string", "name": "eventName", "type": "string" },
      { "internalType": "uint256", "name": "eventDate", "type": "uint256" },
      { "internalType": "uint256", "name": "ticketPrice", "type": "uint256" },
      { "internalType": "uint256", "name": "paymentDeadline", "type": "uint256" }
    ],
    "name": "createPool",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllPools",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getUserCreatedPools",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPoolCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "poolAddress", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "eventName", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "ticketPrice", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "paymentDeadline", "type": "uint256" }
    ],
    "name": "PoolCreated",
    "type": "event"
  }
] as const;

// Lucky Draw Pool ABI
export const LUCKY_DRAW_POOL_ABI = [
  {
    "inputs": [],
    "name": "joinPool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "requestRandomness",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "finalizePool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "cancelPool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPoolInfo",
    "outputs": [
      { "internalType": "string", "name": "_eventName", "type": "string" },
      { "internalType": "uint256", "name": "_eventDate", "type": "uint256" },
      { "internalType": "uint256", "name": "_ticketPrice", "type": "uint256" },
      { "internalType": "uint256", "name": "_entryAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "_maxParticipants", "type": "uint256" },
      { "internalType": "uint256", "name": "_currentParticipants", "type": "uint256" },
      { "internalType": "uint256", "name": "_totalPooled", "type": "uint256" },
      { "internalType": "uint256", "name": "_poolDeadline", "type": "uint256" },
      { "internalType": "address", "name": "_winner", "type": "address" },
      { "internalType": "bool", "name": "_isFinalized", "type": "bool" },
      { "internalType": "bool", "name": "_isCancelled", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getParticipants",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isTargetReached",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "winner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "tlootReward", "type": "uint256" }
    ],
    "name": "ParticipantJoined",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "winner", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "randomNumber", "type": "uint256" }
    ],
    "name": "WinnerSelected",
    "type": "event"
  }
] as const;

// Commit to Claim Pool ABI
export const COMMIT_TO_CLAIM_POOL_ABI = [
  {
    "inputs": [],
    "name": "payUpfront",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "payRemaining",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "finalizePool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "refundUpfront",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPoolInfo",
    "outputs": [
      { "internalType": "string", "name": "_eventName", "type": "string" },
      { "internalType": "uint256", "name": "_eventDate", "type": "uint256" },
      { "internalType": "uint256", "name": "_ticketPrice", "type": "uint256" },
      { "internalType": "uint256", "name": "_paymentDeadline", "type": "uint256" },
      { "internalType": "address", "name": "_creator", "type": "address" },
      { "internalType": "bool", "name": "_upfrontPaid", "type": "bool" },
      { "internalType": "bool", "name": "_remainingPaid", "type": "bool" },
      { "internalType": "bool", "name": "_isFinalized", "type": "bool" },
      { "internalType": "bool", "name": "_isCancelled", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPaymentStatus",
    "outputs": [
      { "internalType": "bool", "name": "_upfrontPaid", "type": "bool" },
      { "internalType": "bool", "name": "_remainingPaid", "type": "bool" },
      { "internalType": "uint256", "name": "_upfrontAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "_remainingAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "_totalPaid", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isPaymentComplete",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "tlootReward", "type": "uint256" }
    ],
    "name": "UpfrontPaid",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "RemainingPaid",
    "type": "event"
  }
] as const;
