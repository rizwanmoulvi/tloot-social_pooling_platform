import { network } from "hardhat";
import { formatEther, formatUnits, parseUnits, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as fs from "fs";
import * as path from "path";

/**
 * Test Lucky Draw Pool End-to-End
 * 1. Create pool with short deadline
 * 2. Have test wallets join
 * 3. Request randomness and select winner
 * 4. Finalize pool
 */

const LUCKY_DRAW_FACTORY = "0xb0b72e6294a73890561ebaf2c91504f48c92d2f4";
const MOCK_USDT = "0x59a2fB83F0f92480702EDEE8f84c72a1eF44BD9b";
const TLOOT_TOKEN = "0xeb812840b585a86c8a59ebb4f28bc5c540db0829";

const FACTORY_ABI = [
  {
    "inputs": [
      {"name": "creator", "type": "address"},
      {"name": "eventName", "type": "string"},
      {"name": "eventDate", "type": "uint256"},
      {"name": "ticketPrice", "type": "uint256"},
      {"name": "entryAmount", "type": "uint256"},
      {"name": "maxParticipants", "type": "uint256"},
      {"name": "poolDeadline", "type": "uint256"}
    ],
    "name": "createPool",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const USDT_ABI = [
  {
    "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const POOL_ABI = [
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
    "name": "getParticipants",
    "outputs": [{"name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "winner",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isFinalized",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "poolDeadline",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const TLOOT_ABI = [
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

async function main() {
  console.log("🎮 Testing Lucky Draw Pool End-to-End\n");
  console.log("=" .repeat(80));

  const { viem } = await network.connect();
  const [admin] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  // Load test wallets
  const walletsDir = path.join(process.cwd(), 'test-wallets');
  const files = fs.readdirSync(walletsDir).filter(f => f.endsWith('.json'));
  
  if (files.length === 0) {
    console.log("❌ No wallet files found in test-wallets/");
    console.log("   Run create-and-fund-wallets.ts first");
    return;
  }

  const latestFile = files.sort().reverse()[0];
  const walletsData = JSON.parse(fs.readFileSync(path.join(walletsDir, latestFile), 'utf-8'));
  
  console.log(`📁 Loaded ${walletsData.length} test wallets from ${latestFile}\n`);

  // Take first 5 wallets for testing
  const testWallets = walletsData.slice(0, 5).map((w: any) => ({
    address: w.address,
    account: privateKeyToAccount(w.privateKey as `0x${string}`)
  }));

  console.log("Test wallets:");
  testWallets.forEach((w: any, i: number) => {
    console.log(`  ${i + 1}. ${w.address}`);
  });
  console.log("");

  // Step 1: Create Lucky Draw Pool
  console.log("=" .repeat(80));
  console.log("STEP 1: Create Lucky Draw Pool");
  console.log("=" .repeat(80));
  console.log("");

  const ticketPrice = parseUnits("100", 6); // $100 ticket
  const entryAmount = parseUnits("10", 6); // $10 entry
  const maxParticipants = 5n; // 5 participants needed
  const eventDate = BigInt(Math.floor(Date.now() / 1000) + 86400 * 30); // 30 days from now
  const poolDeadline = BigInt(Math.floor(Date.now() / 1000) + 120); // 2 minutes from now (immediate testing)

  console.log("Pool Configuration:");
  console.log("- Ticket Price: $100");
  console.log("- Entry Amount: $10");
  console.log("- Max Participants: 5");
  console.log("- Pool Deadline: 2 minutes from now");
  console.log("- Event Name: F1 Abu Dhabi Grand Prix 2026");
  console.log("");

  console.log("Creating pool...");
  const createHash = await admin.writeContract({
    address: LUCKY_DRAW_FACTORY as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: 'createPool',
    args: [
      admin.account.address,
      "F1 Abu Dhabi Grand Prix 2026",
      eventDate,
      ticketPrice,
      entryAmount,
      maxParticipants,
      poolDeadline
    ],
    account: admin.account,
  });

  console.log("Tx:", createHash);
  console.log("Waiting for confirmation...");
  const receipt = await publicClient.waitForTransactionReceipt({ hash: createHash });
  
  // Get the pool address from the transaction receipt
  // The pool is deployed in the transaction, so we can find it in the logs
  // PoolCreated event: event PoolCreated(address indexed poolAddress, address indexed creator, ...)
  const poolCreatedLog = receipt.logs.find(log => 
    log.address.toLowerCase() === LUCKY_DRAW_FACTORY.toLowerCase() &&
    log.topics[0] === '0x9eb6f4e5b1f0a6c0a65a5a8b7c1e8d5e4c3b2a1a0b9c8d7e6f5a4b3c2d1e0f9a'
  );

  // If we can't find by event signature, try to extract from the first indexed parameter
  let poolAddress: `0x${string}`;
  if (poolCreatedLog && poolCreatedLog.topics[1]) {
    // First indexed parameter is the pool address
    poolAddress = `0x${poolCreatedLog.topics[1].slice(26)}` as `0x${string}`;
  } else {
    // Alternative: look for contract creation in the transaction
    console.log("⚠️  Could not find pool address in event logs");
    console.log("Checking receipt for contract creation...");
    
    // For a simple deployment, the new contract address should be deterministic
    // Let's call getAllPools to get the latest pool
    const allPools = await publicClient.readContract({
      address: LUCKY_DRAW_FACTORY as `0x${string}`,
      abi: [{
        "inputs": [],
        "name": "getAllPools",
        "outputs": [{"name": "", "type": "address[]"}],
        "stateMutability": "view",
        "type": "function"
      }],
      functionName: 'getAllPools',
    });
    
    poolAddress = (allPools as `0x${string}`[])[(allPools as any[]).length - 1];
  }

  console.log("✅ Pool created:", poolAddress);
  console.log("");

  // Step 2: Have wallets join the pool
  console.log("=" .repeat(80));
  console.log("STEP 2: Test Wallets Join Pool");
  console.log("=" .repeat(80));
  console.log("");

  for (let i = 0; i < testWallets.length; i++) {
    const wallet = testWallets[i];
    console.log(`\n💰 Wallet ${i + 1}: ${wallet.address}`);
    console.log("-".repeat(80));

    // Check USDT balance
    const usdtBalance = await publicClient.readContract({
      address: MOCK_USDT as `0x${string}`,
      abi: USDT_ABI,
      functionName: 'balanceOf',
      args: [wallet.address],
    });
    console.log("USDT Balance:", formatUnits(usdtBalance as bigint, 6), "USDT");

    // Check TLOOT balance before
    const tlootBefore = await publicClient.readContract({
      address: TLOOT_TOKEN as `0x${string}`,
      abi: TLOOT_ABI,
      functionName: 'balanceOf',
      args: [wallet.address],
    });
    console.log("TLOOT Balance (before):", formatUnits(tlootBefore as bigint, 18), "TLOOT");

    // Approve USDT
    console.log("\n1️⃣ Approving USDT...");
    const approveHash = await viem.getWalletClient(wallet.account).then(client =>
      client.writeContract({
        address: MOCK_USDT as `0x${string}`,
        abi: USDT_ABI,
        functionName: 'approve',
        args: [poolAddress, entryAmount],
        account: wallet.account,
      })
    );
    await publicClient.waitForTransactionReceipt({ hash: approveHash });
    console.log("✅ Approved");

    // Join pool
    console.log("2️⃣ Joining pool...");
    const joinHash = await viem.getWalletClient(wallet.account).then(client =>
      client.writeContract({
        address: poolAddress,
        abi: POOL_ABI,
        functionName: 'joinPool',
        args: [],
        account: wallet.account,
      })
    );
    await publicClient.waitForTransactionReceipt({ hash: joinHash });
    console.log("✅ Joined pool");

    // Check TLOOT balance after
    const tlootAfter = await publicClient.readContract({
      address: TLOOT_TOKEN as `0x${string}`,
      abi: TLOOT_ABI,
      functionName: 'balanceOf',
      args: [wallet.address],
    });
    const tlootReceived = (tlootAfter as bigint) - (tlootBefore as bigint);
    console.log("TLOOT Balance (after):", formatUnits(tlootAfter as bigint, 18), "TLOOT");
    console.log("🎁 TLOOT Received:", formatUnits(tlootReceived, 18), "TLOOT");

    // Delay between participants
    if (i < testWallets.length - 1) {
      console.log("\n⏳ Waiting 3 seconds...");
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Check participants
  console.log("\n");
  console.log("=" .repeat(80));
  console.log("Pool Status Check");
  console.log("=" .repeat(80));
  console.log("");

  const participants = await publicClient.readContract({
    address: poolAddress,
    abi: POOL_ABI,
    functionName: 'getParticipants',
  });

  console.log("Participants:", (participants as any[]).length);
  (participants as any[]).forEach((p: string, i: number) => {
    console.log(`  ${i + 1}. ${p}`);
  });
  console.log("");

  // Step 3: Wait for deadline and request randomness
  console.log("=" .repeat(80));
  console.log("STEP 3: Wait for Deadline & Request Randomness");
  console.log("=" .repeat(80));
  console.log("");

  const deadline = await publicClient.readContract({
    address: poolAddress,
    abi: POOL_ABI,
    functionName: 'poolDeadline',
  });

  const now = Math.floor(Date.now() / 1000);
  const timeLeft = Number(deadline) - now;

  console.log("Current time:", new Date().toISOString());
  console.log("Deadline:", new Date(Number(deadline) * 1000).toISOString());
  console.log("Time remaining:", Math.max(0, timeLeft), "seconds");
  console.log("");

  if (timeLeft > 0) {
    console.log(`⏳ Waiting ${timeLeft + 5} seconds for deadline to pass...`);
    await new Promise(resolve => setTimeout(resolve, (timeLeft + 5) * 1000));
  }

  console.log("🎲 Requesting randomness from Supra VRF...");
  const randomnessHash = await admin.writeContract({
    address: poolAddress,
    abi: POOL_ABI,
    functionName: 'requestRandomness',
    args: [],
    account: admin.account,
  });
  await publicClient.waitForTransactionReceipt({ hash: randomnessHash });
  console.log("✅ Randomness requested - Tx:", randomnessHash);
  console.log("");

  console.log("⚠️  NOTE: Supra VRF callback is asynchronous.");
  console.log("   The winner selection happens when Supra calls back.");
  console.log("   This usually takes 30-60 seconds on testnet.");
  console.log("");
  console.log("⏳ Waiting 60 seconds for VRF callback...");
  await new Promise(resolve => setTimeout(resolve, 60000));

  // Check if winner is selected
  const winner = await publicClient.readContract({
    address: poolAddress,
    abi: POOL_ABI,
    functionName: 'winner',
  });

  if (winner && winner !== "0x0000000000000000000000000000000000000000") {
    console.log("");
    console.log("🎉 WINNER SELECTED!");
    console.log("=" .repeat(80));
    console.log("Winner Address:", winner);
    const winnerIndex = testWallets.findIndex((w: any) => w.address.toLowerCase() === (winner as string).toLowerCase());
    if (winnerIndex !== -1) {
      console.log(`Winner is Wallet #${winnerIndex + 1} from our test wallets! 🎊`);
    }
    console.log("");

    // Step 4: Finalize pool
    console.log("=" .repeat(80));
    console.log("STEP 4: Finalize Pool");
    console.log("=" .repeat(80));
    console.log("");

    console.log("Finalizing pool...");
    const finalizeHash = await admin.writeContract({
      address: poolAddress,
      abi: POOL_ABI,
      functionName: 'finalizePool',
      args: [],
      account: admin.account,
    });
    await publicClient.waitForTransactionReceipt({ hash: finalizeHash });
    console.log("✅ Pool finalized - Tx:", finalizeHash);

    const isFinalized = await publicClient.readContract({
      address: poolAddress,
      abi: POOL_ABI,
      functionName: 'isFinalized',
    });
    console.log("Pool finalized:", isFinalized ? "✅ YES" : "❌ NO");
  } else {
    console.log("");
    console.log("⏳ Winner not selected yet.");
    console.log("   Supra VRF callback is still pending.");
    console.log("   Check back in a minute or monitor the pool contract.");
  }

  console.log("");
  console.log("=" .repeat(80));
  console.log("🎉 LUCKY DRAW TEST COMPLETE");
  console.log("=" .repeat(80));
  console.log("");
  console.log("Summary:");
  console.log("- Pool Address:", poolAddress);
  console.log("- Participants:", (participants as any[]).length);
  console.log("- Winner:", winner || "Pending VRF callback");
  console.log("- Total USDT Collected:", formatUnits((participants as any[]).length * Number(entryAmount), 6), "USDT");
  console.log("");
  console.log("Next: Test Commit-to-Claim Pool");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
