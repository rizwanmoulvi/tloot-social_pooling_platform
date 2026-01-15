# TLOOT - GameFi Social Ticketing Platform

## Project Overview

**TLOOT** is a blockchain-based GameFi platform that democratizes access to premium event tickets by enabling users to collaboratively pool funds, participate in chance-based mechanics, and earn token rewards. Built on **Mantle Sepolia Testnet**, the platform bridges Web3 innovation with real-world asset (RWA) utility.

### Core Value Proposition

Traditional event ticketing suffers from high upfront costs and lack of social engagement. TLOOT solves this by introducing two innovative pool-based systems that make premium event tickets accessible while gamifying the experience with instant token rewards.

---

## Platform Architecture

### Smart Contract Structure

The project employs a **factory-based architecture** with separate contracts for each pool type:

#### Core Contracts

1. **CommitToClaimFactory.sol** - Factory contract that deploys individual Commit-to-Claim pool contracts
2. **CommitToClaimPool.sol** - Individual pool contracts where creators pay for tickets in installments
3. **LuckyDrawFactory.sol** - Factory contract that deploys individual Lucky Draw pool contracts
4. **LuckyDrawPool.sol** - Individual pool contracts with chance-based winner selection
5. **PlatformTokenV2.sol** - TLOOT ERC20 token contract for platform rewards
6. **MockUSDT.sol** - Test USDT token for development

#### Alternative: SimplePoolManager

The project also includes **SimplePoolManager.sol**, a unified contract that manages all pools and mints TLOOT tokens in an Aave-style architecture (currently in use for simplified deployment).

### Technology Stack

**Blockchain & Smart Contracts:**
- Solidity 0.8.28
- Hardhat 3.1.3 (development framework)
- OpenZeppelin Contracts 5.4.0 (security standards)
- Supra dVRF (verifiable randomness for Lucky Draw)
- Deployed on Mantle Sepolia Testnet (Chain ID: 5003)

**Frontend Application:**
- Next.js 16.1.1 with React 19.2.3
- TypeScript 5.8.3
- Wagmi 3.3.2 + Viem 2.44.2 (Web3 interactions)
- RainbowKit 2.2.10 (wallet connection)
- Zustand 5.0.10 (state management)
- TailwindCSS 4.1.18 (styling)
- Framer Motion 12.26.2 (animations)

**Developer Tools:**
- pnpm (package manager)
- ESLint + Prettier (code quality)
- dotenv (environment configuration)

---

## Pool Mechanics

### 1. Commit-to-Claim Pools

**Concept:** Users reserve event tickets by making upfront payments (20% of ticket price) and completing the remaining payment before a deadline.

**Flow:**
1. Pool creator creates a pool by paying 20% upfront commitment
2. Creator must pay remaining 80% before payment deadline (typically 30 days before event)
3. Upon full payment, tickets are reserved for the creator
4. Creator receives TLOOT tokens as rewards for timely payment
5. If payment deadline is missed, pool is cancelled and upfront amount is refunded

**Key Features:**
- Variable contribution amounts (minimum 1 USDT, maximum 80% of remaining)
- Unlimited participants
- Instant TLOOT token rewards (1:1 with USDT contribution)
- No debt beyond deadline - all payments complete before event
- Automatic pool finalization when fully funded

### 2. Lucky Draw Pools

**Concept:** Users contribute small fixed amounts for a chance to win event tickets through verifiable randomness.

**Flow:**
1. Pool creator sets entry amount and maximum participants
2. Users join by paying the fixed entry amount
3. Each contribution equals one lottery entry
4. When pool fills, random winner is selected via Supra dVRF
5. Winner pays 20% claim fee to receive the ticket
6. All participants receive TLOOT tokens instantly (including winner)
7. Claim fee is distributed between platform and participants

**Key Features:**
- Fixed entry amount per participant
- Limited participant slots (set at pool creation)
- Verifiable randomness via Supra dVRF integration
- Winner pays claim fee (20% of ticket price)
- Fair and transparent winner selection
- All participants earn TLOOT rewards

---

## TLOOT Token Economics

### Token Specifications
- **Name:** TLOOT Token
- **Symbol:** TLOOT
- **Type:** ERC20
- **Decimals:** 18
- **Max Supply:** 1,000,000,000 TLOOT (1 billion tokens)

### Minting Mechanism
- **1:1 Minting:** Users receive TLOOT tokens equal to their USDT contribution (accounting for decimal differences)
- **Instant Rewards:** Tokens minted immediately upon joining pools
- **Aave-Style Architecture:** Built directly into pool manager contract
- **Initial Supply:** 10% minted to deployer for initial platform operations

### Utility
- Represents user participation in the platform
- Future governance rights
- Platform fee discounts
- Access to exclusive pools
- Staking rewards (planned)

---

## Smart Contract Architecture Deep Dive

### Factory Pattern Benefits

1. **Isolation:** Each pool is an independent contract with its own state
2. **Security:** Pool failures don't affect other pools or main contracts
3. **Flexibility:** Different pool types can have specialized logic
4. **Upgradability:** New pool types can be added without affecting existing ones
5. **Gas Optimization:** Only pay for deployment when creating pools

### Key Contract Features

**CommitToClaimPool.sol:**
- Creator-owned pools (creator is ticket recipient)
- Upfront and remaining payment tracking
- Automatic refund mechanism on cancellation
- Admin withdrawal for ticket purchase
- TLOOT rewards for timely payments

**LuckyDrawPool.sol:**
- Fixed-entry participation model
- Participant list and contribution tracking
- Integration with Supra dVRF for randomness
- Winner selection callback mechanism
- Claim fee collection and distribution
- Refund mechanism if target not reached

**PlatformTokenV2.sol:**
- Standard ERC20 with minting capability
- Max supply enforcement
- Only factory/pool contracts can mint
- Burn functionality for deflationary mechanics
- Transfer restrictions (optional)

---

## Frontend Application Structure

### Page Routes

- `/` - Landing page with platform overview and stats
- `/pools` - Browse all active pools with filtering
- `/pools/[id]` - Individual pool detail page
- `/pools/create` - Create new pool (Commit-to-Claim or Lucky Draw)
- `/dashboard` - User dashboard showing joined pools and rewards
- `/rewards` - TLOOT token balance and rewards history
- `/claim` - Claim winning tickets (for Lucky Draw winners)

### Key Components

**Layout Components:**
- Header with wallet connection (RainbowKit)
- Navigation menu
- Footer

**Pool Components:**
- PoolGrid - Display pools in grid layout
- PoolCard - Individual pool preview card
- PoolDetails - Detailed pool information
- JoinPoolModal - Modal for joining pools
- CreatePoolForm - Multi-step pool creation form

**UI Components:**
- Button, Input, Dialog, Tabs (Radix UI primitives)
- Countdown timer for pool deadlines
- Progress bars for pool funding status
- Confetti animations for winners

### State Management (Zustand)

**Pool Store:**
- Loads pools from blockchain
- Manages pool filtering and sorting
- Handles pool creation
- Tracks user's joined pools

**User Store:**
- Wallet connection state
- User's TLOOT balance
- Joined pools history
- Transaction history

---

## Supra dVRF Integration

### Random Number Generation

TLOOT uses **Supra dVRF (Verifiable Random Function)** for provably fair winner selection in Lucky Draw pools.

**Configuration (Mantle Sepolia):**
- Router Contract: `0x214F9eD5750D2fC87ae084184e999Ff7DFa1EB09`
- Deposit Contract: `0xd6675f4fD26119bF729B0fF912c28022a63Ae0a9`

**How it works:**
1. Pool contract requests randomness from Supra Router
2. Supra network generates verifiable random number
3. Random number is returned via callback function
4. Winner is selected: `winner = participants[randomNumber % participants.length]`
5. Winner can claim ticket by paying claim fee

**Benefits:**
- Cryptographically secure randomness
- Verifiable on-chain
- No manipulation possible
- Transparent and auditable

---

## Deployment & Configuration

### Environment Variables

```env
# Wallet Configuration
PRIVATE_KEY=your_private_key_here

# Network Configuration
NEXT_PUBLIC_MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz
NEXT_PUBLIC_CHAIN_ID=5003

# Contract Addresses
NEXT_PUBLIC_POOL_MANAGER_ADDRESS=0xe4478d8dcab3f8daf7b167d21fadc7e3f20599da
NEXT_PUBLIC_TOKEN_ADDRESS=0xe4478d8dcab3f8daf7b167d21fadc7e3f20599da
NEXT_PUBLIC_USDT_ADDRESS=0x59a2fB83F0f92480702EDEE8f84c72a1eF44BD9b

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### Deployment Scripts

- `deploy-tloot-v2.ts` - Deploy SimplePoolManager (unified architecture)
- `deploy-factories.ts` - Deploy factory contracts (modular architecture)
- `create-test-pool.ts` - Create test pools for development
- `grant-admin-roles.ts` - Set up admin permissions
- `test-lucky-draw.ts` - Test Lucky Draw functionality
- `transfer-tloot-to-factories.ts` - Fund factories with TLOOT for rewards

---

## Development Workflow

### Local Development

```bash
# Install dependencies
pnpm install

# Compile smart contracts
npx hardhat compile

# Run local development server
pnpm run dev

# Deploy contracts to testnet
npx hardhat run scripts/deploy-tloot-v2.ts --network mantleSepolia
```

### Testing

```bash
# Run Hardhat tests
npx hardhat test

# Run specific test file
npx hardhat test test/Counter.ts
```

### Contract Interaction Scripts

The project includes numerous utility scripts for contract interaction:
- Pool creation and management
- Wallet funding for testing
- Token transfers
- Permission management
- Pool finalization and winner selection

---

## Security Considerations

### Smart Contract Security

1. **OpenZeppelin Standards:** All contracts inherit from audited OpenZeppelin libraries
2. **Reentrancy Protection:** `ReentrancyGuard` on all state-changing functions
3. **Access Control:** `Ownable` pattern for admin functions
4. **Input Validation:** Extensive `require` statements for parameter validation
5. **Safe Math:** Solidity 0.8+ built-in overflow protection

### Key Security Features

- **Deadline Enforcement:** Pools automatically cancel after deadline
- **Contribution Limits:** Min/max contribution amounts prevent abuse
- **Withdrawal Controls:** Only admin can withdraw for ticket purchases
- **Refund Mechanism:** Automatic refunds if targets not reached
- **No Debt Risk:** All payments complete before event date
- **Verifiable Randomness:** Supra dVRF prevents manipulation

---

## User Experience Flow

### For Pool Creators (Commit-to-Claim)

1. Connect wallet via RainbowKit
2. Navigate to "Create Pool"
3. Enter event details and ticket price
4. Pay 20% upfront commitment in USDT
5. Receive instant TLOOT tokens
6. Complete remaining payment before deadline
7. Receive additional TLOOT rewards
8. Admin purchases and delivers ticket

### For Participants (Lucky Draw)

1. Connect wallet
2. Browse active Lucky Draw pools
3. Select desired pool and pay entry amount
4. Receive instant TLOOT tokens
5. Wait for pool to fill
6. Random winner selected automatically
7. Winner pays 20% claim fee to receive ticket
8. All participants keep their TLOOT rewards

---

## Key Differentiators

1. **Real-World Utility:** Actual event tickets, not just digital collectibles
2. **Social Collaboration:** Pool-based approach reduces individual costs
3. **Instant Rewards:** Immediate TLOOT token gratification
4. **Fair Mechanics:** Verifiable randomness and transparent rules
5. **No Debt Risk:** All payments complete before events
6. **Flexible Participation:** Variable contributions in Commit-to-Claim pools
7. **Blockchain Transparency:** All transactions verifiable on-chain

---

## Current Status

**Network:** Mantle Sepolia Testnet (5003)
**Deployed Contracts:**
- SimplePoolManager: `0xe4478d8dcab3f8daf7b167d21fadc7e3f20599da`
- Mock USDT: `0x59a2fB83F0f92480702EDEE8f84c72a1eF44BD9b`

**Development Status:**
- ✅ Smart contracts deployed and tested
- ✅ Frontend application functional
- ✅ Wallet integration complete
- ✅ Pool creation and joining working
- ✅ TLOOT token minting operational
- 🔄 Supra dVRF integration (in progress)
- 🔄 Claim flow implementation
- 🔄 Dashboard and rewards pages

---

## Future Roadmap

### Short-term
- Complete Supra dVRF integration for winner selection
- Implement claim flow for Lucky Draw winners
- Add comprehensive dashboard analytics
- Deploy to Mantle mainnet
- Real event integrations

### Medium-term
- TLOOT staking for yield
- Governance mechanisms
- Secondary market for pool positions
- Mobile app development
- Partnership with ticketing platforms

### Long-term
- Multi-chain deployment
- NFT ticket integration
- DAO governance
- Advanced pool types (auctions, blind pools)
- Event organizer tooling

---

## Project Structure

```
tezy/
├── contracts/              # Solidity smart contracts
│   ├── CommitToClaimFactory.sol
│   ├── CommitToClaimPool.sol
│   ├── LuckyDrawFactory.sol
│   ├── LuckyDrawPool.sol
│   ├── PlatformTokenV2.sol
│   ├── SimplePoolManager.sol
│   └── MockUSDT.sol
├── scripts/               # Deployment and utility scripts
├── test/                  # Contract tests
├── src/                   # Next.js frontend application
│   ├── app/              # App router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities and configs
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand state management
│   └── types/            # TypeScript definitions
├── public/               # Static assets
├── artifacts/            # Compiled contract artifacts
└── ignition/             # Hardhat Ignition modules
```

---

## Contributing

This project was built for the **Mantle Hackathon** as a demonstration of how blockchain technology can solve real-world problems in the ticketing industry while providing engaging GameFi experiences.

---

## License

MIT

---

## Contact & Links

- **GitHub:** [Repository Link]
- **Documentation:** [Docs Link]
- **Twitter:** [@tloot]
- **Discord:** [Community Link]

---

*Built with ❤️ on Mantle by the TLOOT team*
