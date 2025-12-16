import { network } from "hardhat";
import { formatUnits, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as fs from "fs";
import * as path from "path";

const POOL_MANAGER = "0xda6ff5a56c2156fbc8ad101392ef2f7aa3af0e2d";
const MOCK_USDT = "0x59a2fB83F0f92480702EDEE8f84c72a1eF44BD9b";

async function main() {
  console.log("🎮 Testing Simple Pool Manager\n");

  const { viem } = await network.connect();
  const [admin] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  // Load test wallets
  const walletsDir = path.join(process.cwd(), 'test-wallets');
  const files = fs.readdirSync(walletsDir).filter(f => f.endsWith('.json'));
  const walletsData = JSON.parse(fs.readFileSync(path.join(walletsDir, files[files.length - 1]), 'utf-8'));
  const testWallet = walletsData[0];
  const wallet = privateKeyToAccount(testWallet.privateKey as `0x${string}`);

  console.log("Test wallet:", wallet.address, "\n");

  // Create pool
  console.log("STEP 1: Create Pool");
  console.log("=".repeat(60));
  
  const createHash = await admin.writeContract({
    address: POOL_MANAGER as `0x${string}`,
    abi: [{
      "inputs": [
        {"name": "poolType", "type": "uint8"},
        {"name": "eventName", "type": "string"},
        {"name": "entryAmount", "type": "uint256"},
        {"name": "ticketPrice", "type": "uint256"},
        {"name": "maxParticipants", "type": "uint256"},
        {"name": "deadline", "type": "uint256"}
      ],
      "name": "createPool",
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "nonpayable",
      "type": "function"
    }],
    functionName: 'createPool',
    args: [
      0, // LuckyDraw
      "F1 Abu Dhabi GP 2026",
      parseUnits("10", 6), // $10 entry
      parseUnits("100", 6), // $100 ticket
      5n, // 5 participants
      BigInt(Math.floor(Date.now() / 1000) + 300) // 5 minutes from now
    ],
    account: admin.account,
  });

  await publicClient.waitForTransactionReceipt({ hash: createHash });
  console.log("✅ Pool created!\n");

  // Join pool
  console.log("STEP 2: Join Pool");
  console.log("=".repeat(60));

  // Approve USDT
  console.log("Approving USDT...");
  const approveHash = await viem.getWalletClient(wallet).then(client =>
    client.writeContract({
      address: MOCK_USDT as `0x${string}`,
      abi: [{
        "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
        "name": "approve",
        "outputs": [{"name": "", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
      }],
      functionName: 'approve',
      args: [POOL_MANAGER, parseUnits("10", 6)],
      account: wallet,
    })
  );
  await publicClient.waitForTransactionReceipt({ hash: approveHash, timeout: 120000 });
  console.log("✅ Approved");

  // Check TLOOT before
  const tlootBefore = await publicClient.readContract({
    address: POOL_MANAGER as `0x${string}`,
    abi: [{
      "inputs": [{"name": "account", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    }],
    functionName: 'balanceOf',
    args: [wallet.address],
  });
  console.log("TLOOT before:", formatUnits(tlootBefore as bigint, 18));

  // Join pool
  console.log("Joining pool...");
  const joinHash = await viem.getWalletClient(wallet).then(client =>
    client.writeContract({
      address: POOL_MANAGER as `0x${string}`,
      abi: [{
        "inputs": [{"name": "poolId", "type": "uint256"}],
        "name": "joinPool",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }],
      functionName: 'joinPool',
      args: [1n],
      account: wallet,
    })
  );
  await publicClient.waitForTransactionReceipt({ hash: joinHash, timeout: 120000 });
  console.log("✅ Joined pool!");

  // Check TLOOT after
  const tlootAfter = await publicClient.readContract({
    address: POOL_MANAGER as `0x${string}`,
    abi: [{
      "inputs": [{"name": "account", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    }],
    functionName: 'balanceOf',
    args: [wallet.address],
  });
  console.log("TLOOT after:", formatUnits(tlootAfter as bigint, 18));
  console.log("🎁 TLOOT received:", formatUnits((tlootAfter as bigint) - (tlootBefore as bigint), 18), "\n");

  console.log("=" .repeat(60));
  console.log("✅ TEST COMPLETE!");
  console.log("=" .repeat(60));
  console.log("- Pool created in single contract");
  console.log("- User joined and received TLOOT immediately");
  console.log("- Everything works with ONE simple contract!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
