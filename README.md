# tloot

A GameFi platform that makes event tickets more accessible through collaborative pool funding and lucky draw mechanics. Built on Mantle.

## What's this about?

Let's be honest - premium event tickets are expensive. Like, really expensive. Whether it's that concert you've been wanting to see or a sports game, dropping hundreds of dollars upfront isn't always feasible.

tloot takes a different approach. Instead of buying tickets alone, users pool their funds together with others who want to attend the same event. Think of it as group buying meets GameFi, with some interesting mechanics thrown in.

## How it works

We support two ways to participate:

### 1. Commit-to-Claim Pools
The straightforward one. Users contribute to a pool (anywhere from 1 USDT up to 80% of what's remaining). Once the pool fills up and the ticket is secured, participants complete their payment before the event. It's kind of like a group reservation system.

If someone doesn't pay up, their initial commitment is redistributed as token rewards to everyone else. Fair's fair.

### 2. Lucky Draw Pools
The fun one. Chip in a small amount for a chance to win the ticket. When the pool completes, a random winner gets selected. They pay a 20% claim fee, and everyone who participated gets TLOOT tokens as consolation. So even if you don't win, you walk away with something.

## TLOOT tokens

Every time you contribute to a pool, you get TLOOT tokens minted instantly (1:1 with your USDT contribution). Think of it like Aave's model - the tokens are built right into the pool manager contract.

These aren't just collectibles. They represent your participation and can be used for platform utilities down the road.

## Tech stack

**Frontend:**
- Next.js 16.1 with React 19
- Wagmi + Viem for wallet interactions
- RainbowKit for wallet connection
- Zustand for state management
- TailwindCSS for styling
- Framer Motion for animations

**Smart Contracts:**
- Solidity 0.8.28
- Hardhat for development
- OpenZeppelin contracts
- Deployed on Mantle Sepolia testnet

**Architecture:**
We went with a simplified approach - one `SimplePoolManager` contract handles everything. No factories, no complexity. It manages both pool types, handles contributions with variable amounts, and mints TLOOT tokens all in one place.

## Getting started

Clone the repo and install dependencies:

```bash
pnpm install
```

Set up your environment variables. Copy `.env.local` and add your keys:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz
NEXT_PUBLIC_POOL_MANAGER_ADDRESS=0xe4478d8dcab3f8daf7b167d21fadc7e3f20599da
NEXT_PUBLIC_TOKEN_ADDRESS=0xe4478d8dcab3f8daf7b167d21fadc7e3f20599da
NEXT_PUBLIC_USDT_ADDRESS=0x59a2fB83F0f92480702EDEE8f84c72a1eF44BD9b
PRIVATE_KEY=your_private_key_here
```

Run the dev server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're good to go.

## Smart contracts

Compile contracts:

```bash
npx hardhat compile
```

Deploy to Mantle Sepolia:

```bash
npx hardhat run scripts/deploy-tloot-v2.ts --network mantleSepolia
```

The main contract is `SimplePoolManager` - it's basically all you need. Handles pool creation, variable contributions, winner selection, and token minting.

## Key features

- **Variable contributions**: For Commit-to-Claim pools, contribute anywhere from 1 USDT to 80% of remaining amount
- **Auto-finalization**: Pools automatically finalize when fully funded
- **Instant rewards**: Get TLOOT tokens immediately when joining pools
- **No participant limits**: Commit-to-Claim pools can have unlimited participants (unlike Lucky Draw which has a fixed cap)
- **Transparent mechanics**: Everything happens on-chain, verifiable by anyone

## Project structure

```
tezy/
├── contracts/              # Smart contracts
│   ├── SimplePoolManager.sol
│   ├── MockUSDT.sol
│   └── ...
├── scripts/               # Deployment scripts
├── src/
│   ├── app/              # Next.js pages
│   │   ├── pools/        # Pool browsing and details
│   │   ├── dashboard/    # User dashboard
│   │   └── rewards/      # Token rewards page
│   ├── components/       # React components
│   ├── lib/             # Utilities and constants
│   ├── store/           # Zustand stores
│   └── types/           # TypeScript types
└── ...
```

## Network info

**Mantle Sepolia Testnet**
- Chain ID: 5003
- RPC: https://rpc.sepolia.mantle.xyz
- Explorer: https://sepolia.mantlescan.xyz

**Deployed Contracts:**
- SimplePoolManager: `0xe4478d8dcab3f8daf7b167d21fadc7e3f20599da`
- MockUSDT: `0x59a2fB83F0f92480702EDEE8f84c72a1eF44BD9b`

## Contributing

This was built for the Mantle Hackathon. If you want to contribute or have ideas, feel free to open an issue or PR.

## License

MIT
