import { createPublicClient, createWalletClient, http, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mantleSepoliaTestnet } from 'wagmi/chains';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SIMPLE_POOL_MANAGER = "0xda6ff5a56c2156fbc8ad101392ef2f7aa3af0e2d";
const USDT_ADDRESS = "0x59a2fB83F0f92480702EDEE8f84c72a1eF44BD9b";

// Load test wallets
const walletsPath = join(__dirname, '../test-wallets/wallets-1768427027585.json');
const wallets = JSON.parse(readFileSync(walletsPath, 'utf-8'));

const publicClient = createPublicClient({
  chain: mantleSepoliaTestnet,
  transport: http("https://rpc.sepolia.mantle.xyz", {
    timeout: 180_000, // 3 minutes
    retryCount: 3,
    retryDelay: 5000,
  }),
});

// Simple ABI for the functions we need
const POOL_MANAGER_ABI = [
  {
    inputs: [
      { internalType: "uint8", name: "poolType", type: "uint8" },
      { internalType: "string", name: "eventName", type: "string" },
      { internalType: "uint256", name: "entryAmount", type: "uint256" },
      { internalType: "uint256", name: "ticketPrice", type: "uint256" },
      { internalType: "uint256", name: "maxParticipants", type: "uint256" },
      { internalType: "uint256", name: "deadline", type: "uint256" }
    ],
    name: "createPool",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "poolId", type: "uint256" }],
    name: "joinPool",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "poolId", type: "uint256" }],
    name: "getPool",
    outputs: [
      {
        internalType: "tuple",
        name: "",
        type: "tuple",
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "uint8", name: "poolType", type: "uint8" },
          { internalType: "uint8", name: "status", type: "uint8" },
          { internalType: "address", name: "creator", type: "address" },
          { internalType: "string", name: "eventName", type: "string" },
          { internalType: "uint256", name: "entryAmount", type: "uint256" },
          { internalType: "uint256", name: "ticketPrice", type: "uint256" },
          { internalType: "uint256", name: "maxParticipants", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "uint256", name: "totalPooled", type: "uint256" },
          { internalType: "address", name: "winner", type: "address" },
          { internalType: "address[]", name: "participants", type: "address[]" }
        ]
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

const USDT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

async function main() {
  console.log("🎮 TESTING LUCKY DRAW POOL WITH 10 WALLETS\n");
  console.log("=" .repeat(60));
  
  // Use first wallet as pool creator
  const creatorWallet = wallets[0];
  const creatorAccount = privateKeyToAccount(creatorWallet.privateKey as `0x${string}`);
  
  const creatorClient = createWalletClient({
    account: creatorAccount,
    chain: mantleSepoliaTestnet,
    transport: http("https://rpc.sepolia.mantle.xyz", {
      timeout: 180_000,
      retryCount: 3,
      retryDelay: 5000,
    }),
  });

  console.log(`\n📝 STEP 1: CREATE LUCKY DRAW POOL`);
  console.log(`Creator: ${creatorWallet.address}`);
  
  // Pool parameters
  const entryAmount = parseUnits("5", 6); // 5 USDT entry
  const ticketPrice = parseUnits("50", 6); // 50 USDT ticket (can fit 10 people)
  const maxParticipants = 10;
  const deadline = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours from now
  
  console.log(`\nPool Settings:`);
  console.log(`  - Entry Amount: 5 USDT`);
  console.log(`  - Ticket Price: 50 USDT`);
  console.log(`  - Max Participants: ${maxParticipants}`);
  console.log(`  - Deadline: 24 hours from now`);
  
  try {
    // Create pool
    console.log(`\n⏳ Creating pool...`);
    const createHash = await creatorClient.writeContract({
      address: SIMPLE_POOL_MANAGER as `0x${string}`,
      abi: POOL_MANAGER_ABI,
      functionName: 'createPool',
      args: [
        0, // PoolType.LuckyDraw
        "Taylor Swift Concert - 10 Person Pool Test",
        entryAmount,
        ticketPrice,
        BigInt(maxParticipants),
        BigInt(deadline)
      ],
    });
    
    console.log(`   Transaction: ${createHash}`);
    console.log(`   Waiting for confirmation...`);
    
    const receipt = await publicClient.waitForTransactionReceipt({ 
      hash: createHash,
      timeout: 120_000 
    });
    
    if (receipt.status !== 'success') {
      throw new Error("Pool creation failed");
    }
    
    // Extract poolId from logs (first indexed parameter)
    const poolIdHex = receipt.logs[0].topics[1];
    const poolId = BigInt(poolIdHex as string);
    
    console.log(`✅ Pool created! Pool ID: ${poolId}\n`);
    
    // Get pool data
    const poolData = await publicClient.readContract({
      address: SIMPLE_POOL_MANAGER as `0x${string}`,
      abi: POOL_MANAGER_ABI,
      functionName: 'getPool',
      args: [poolId],
    }) as any;
    
    console.log(`Pool Details:`);
    console.log(`  - Creator: ${poolData.creator}`);
    console.log(`  - Event: ${poolData.eventName}`);
    console.log(`  - Status: ${poolData.status === 0 ? 'Active' : 'Not Active'}`);
    console.log(`  - Participants: ${poolData.participants.length}/${poolData.maxParticipants}`);
    console.log(`  - Entry Amount: ${Number(poolData.entryAmount) / 1e6} USDT`);
    console.log(`  - Ticket Price: ${Number(poolData.ticketPrice) / 1e6} USDT`);
    console.log(`  - Total Pooled: ${Number(poolData.totalPooled) / 1e6} USDT`);
    
    console.log(`\n${"=".repeat(60)}`);
    console.log(`\n👥 STEP 2: ALL 10 WALLETS JOIN POOL\n`);
    
    let successCount = 0;
    let totalTloot = 0n;
    
    for (let i = 0; i < 10; i++) {
      const wallet = wallets[i];
      const account = privateKeyToAccount(wallet.privateKey as `0x${string}`);
      
      const walletClient = createWalletClient({
        account,
        chain: mantleSepoliaTestnet,
        transport: http("https://rpc.sepolia.mantle.xyz", {
          timeout: 180_000,
          retryCount: 3,
          retryDelay: 5000,
        }),
      });
      
      console.log(`\n[${i + 1}/10] Wallet: ${wallet.address.slice(0, 10)}...`);
      
      try {
        // Get TLOOT balance before
        const tlootBefore = await publicClient.readContract({
          address: SIMPLE_POOL_MANAGER as `0x${string}`,
          abi: POOL_MANAGER_ABI,
          functionName: 'balanceOf',
          args: [wallet.address as `0x${string}`],
        });
        
        // Step 1: Approve USDT
        console.log(`   ⏳ Approving USDT...`);
        const approveHash = await walletClient.writeContract({
          address: USDT_ADDRESS as `0x${string}`,
          abi: USDT_ABI,
          functionName: 'approve',
          args: [SIMPLE_POOL_MANAGER as `0x${string}`, entryAmount],
        });
        
        await publicClient.waitForTransactionReceipt({ 
          hash: approveHash,
          timeout: 120_000 
        });
        console.log(`   ✅ USDT approved`);
        
        // Step 2: Join pool
        console.log(`   ⏳ Joining pool...`);
        const joinHash = await walletClient.writeContract({
          address: SIMPLE_POOL_MANAGER as `0x${string}`,
          abi: POOL_MANAGER_ABI,
          functionName: 'joinPool',
          args: [poolId],
        });
        
        await publicClient.waitForTransactionReceipt({ 
          hash: joinHash,
          timeout: 120_000 
        });
        
        // Get TLOOT balance after
        const tlootAfter = await publicClient.readContract({
          address: SIMPLE_POOL_MANAGER as `0x${string}`,
          abi: POOL_MANAGER_ABI,
          functionName: 'balanceOf',
          args: [wallet.address as `0x${string}`],
        });
        
        const tlootReceived = tlootAfter - tlootBefore;
        totalTloot += tlootReceived;
        
        console.log(`   ✅ Joined pool! TLOOT received: ${Number(tlootReceived) / 1e18}`);
        successCount++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error: any) {
        console.log(`   ❌ Failed: ${error.message}`);
      }
    }
    
    console.log(`\n${"=".repeat(60)}`);
    console.log(`\n📊 FINAL RESULTS\n`);
    
    // Get final pool state
    const finalPoolData = await publicClient.readContract({
      address: SIMPLE_POOL_MANAGER as `0x${string}`,
      abi: POOL_MANAGER_ABI,
      functionName: 'getPool',
      args: [poolId],
    }) as any;
    
    console.log(`Pool Status:`);
    console.log(`  - Participants: ${finalPoolData.participants.length}/${finalPoolData.maxParticipants}`);
    console.log(`  - Total Pooled: ${Number(finalPoolData.totalPooled) / 1e6} USDT`);
    console.log(`  - Status: ${finalPoolData.status === 0 ? '✅ Active' : '❌ Not Active'}`);
    console.log(`  - Pool Full: ${finalPoolData.participants.length === Number(finalPoolData.maxParticipants) ? '✅ Yes' : '❌ No'}`);
    
    console.log(`\nWallets Joined: ${successCount}/10`);
    console.log(`Total TLOOT Minted: ${Number(totalTloot) / 1e18} TLOOT`);
    console.log(`Expected TLOOT: ${10 * 5} TLOOT (10 wallets × 5 USDT)`);
    
    if (successCount === 10) {
      console.log(`\n🎉 SUCCESS! All 10 wallets joined the pool!`);
    } else {
      console.log(`\n⚠️  Only ${successCount} wallets joined successfully`);
    }
    
    console.log(`\n${"=".repeat(60)}`);
    console.log(`\nPool ID: ${poolId}`);
    console.log(`View on Explorer: https://sepolia.mantlescan.xyz/address/${SIMPLE_POOL_MANAGER}`);
    
  } catch (error: any) {
    console.error(`\n❌ Error: ${error.message}`);
    if (error.data) {
      console.error(`Error data:`, error.data);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
