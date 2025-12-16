import { network } from "hardhat";
import { formatEther, formatUnits, parseEther, parseUnits } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import * as fs from "fs";
import * as path from "path";

/**
 * Create 10 test wallets, fund them with MNT and MockUSDT
 */

async function main() {
  console.log("🏦 Creating and funding 10 test wallets...\n");

  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();
  
  const MAIN_WALLET = "0xeeC48cB64225B10f19BaecB171cc98f8DF231445";
  const MOCK_USDT = "0x59a2fB83F0f92480702EDEE8f84c72a1eF44BD9b";
  const MNT_PER_WALLET = parseEther("0.1"); // 0.1 MNT
  const USDT_PER_WALLET = parseUnits("1000", 6); // 1000 USDT (6 decimals)

  console.log("Main Wallet:", MAIN_WALLET);
  console.log("Deployer:", deployer.account.address);
  console.log("");

  // Check main wallet balance
  const mntBalance = await publicClient.getBalance({ address: MAIN_WALLET as `0x${string}` });
  console.log("Main Wallet MNT Balance:", formatEther(mntBalance), "MNT");
  console.log("");

  // Check USDT balance
  const USDT_ABI = [
    {
      "inputs": [{"name": "account", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
      "name": "transfer",
      "outputs": [{"name": "", "type": "bool"}],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  const usdtBalance = await publicClient.readContract({
    address: MOCK_USDT as `0x${string}`,
    abi: USDT_ABI,
    functionName: 'balanceOf',
    args: [deployer.account.address],
  });

  console.log("Deployer USDT Balance:", formatUnits(usdtBalance as bigint, 6), "USDT");
  console.log("");

  // Check if we have enough
  const totalMntNeeded = MNT_PER_WALLET * 10n;
  const totalUsdtNeeded = USDT_PER_WALLET * 10n;

  console.log("Resources Needed:");
  console.log("- Total MNT:  ", formatEther(totalMntNeeded), "MNT");
  console.log("- Total USDT: ", formatUnits(totalUsdtNeeded, 6), "USDT");
  console.log("");

  if (mntBalance < totalMntNeeded) {
    console.log("❌ ERROR: Insufficient MNT balance");
    console.log("   Have:", formatEther(mntBalance), "MNT");
    console.log("   Need:", formatEther(totalMntNeeded), "MNT");
    return;
  }

  if ((usdtBalance as bigint) < totalUsdtNeeded) {
    console.log("❌ ERROR: Insufficient USDT balance");
    console.log("   Have:", formatUnits(usdtBalance as bigint, 6), "USDT");
    console.log("   Need:", formatUnits(totalUsdtNeeded, 6), "USDT");
    return;
  }

  console.log("✅ Sufficient funds available\n");
  console.log("=" .repeat(60));
  console.log("Creating and funding wallets...");
  console.log("=" .repeat(60));
  console.log("");

  const wallets = [];

  for (let i = 1; i <= 10; i++) {
    console.log(`\n🔑 Wallet ${i}/10`);
    console.log("-".repeat(60));

    // Generate new wallet
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    
    console.log("Address:", account.address);
    console.log("Private Key:", privateKey);

    // Step 1: Send MNT
    console.log(`\n💸 Sending ${formatEther(MNT_PER_WALLET)} MNT...`);
    const mntHash = await deployer.sendTransaction({
      to: account.address,
      value: MNT_PER_WALLET,
      account: deployer.account,
    });
    console.log("   Tx sent:", mntHash);
    console.log("   Waiting for confirmation...");
    await publicClient.waitForTransactionReceipt({ 
      hash: mntHash,
      timeout: 120_000, // 120 second timeout
      pollingInterval: 2_000, // Check every 2 seconds
    });
    console.log("✅ MNT confirmed");

    // Wait between transactions
    console.log("⏳ Waiting 5 seconds...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 2: Send USDT
    console.log(`💸 Sending ${formatUnits(USDT_PER_WALLET, 6)} USDT...`);
    const usdtHash = await deployer.writeContract({
      address: MOCK_USDT as `0x${string}`,
      abi: USDT_ABI,
      functionName: 'transfer',
      args: [account.address, USDT_PER_WALLET],
      account: deployer.account,
    });
    console.log("   Tx sent:", usdtHash);
    console.log("   Waiting for confirmation...");
    await publicClient.waitForTransactionReceipt({ 
      hash: usdtHash,
      timeout: 120_000, // 120 second timeout
      pollingInterval: 2_000, // Check every 2 seconds
    });
    console.log("✅ USDT confirmed");

    // Verify balances
    const finalMnt = await publicClient.getBalance({ address: account.address });
    const finalUsdt = await publicClient.readContract({
      address: MOCK_USDT as `0x${string}`,
      abi: USDT_ABI,
      functionName: 'balanceOf',
      args: [account.address],
    });

    console.log("\n✅ Wallet funded successfully:");
    console.log("   MNT:  ", formatEther(finalMnt), "MNT");
    console.log("   USDT: ", formatUnits(finalUsdt as bigint, 6), "USDT");

    wallets.push({
      index: i,
      address: account.address,
      privateKey: privateKey,
      mntBalance: formatEther(finalMnt),
      usdtBalance: formatUnits(finalUsdt as bigint, 6),
    });

    // Small delay to avoid rate limiting
    if (i < 10) {
      console.log("\n⏳ Waiting 5 seconds before next wallet...");
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log("\n");
  console.log("=" .repeat(60));
  console.log("🎉 ALL WALLETS CREATED AND FUNDED");
  console.log("=" .repeat(60));
  console.log("");

  // Save to file
  const outputDir = path.join(process.cwd(), 'test-wallets');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFile = path.join(outputDir, `wallets-${Date.now()}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(wallets, null, 2));

  console.log("📁 Wallet details saved to:", outputFile);
  console.log("");

  // Display summary table
  console.log("Summary:");
  console.log("-".repeat(80));
  console.log("| # | Address                                      | MNT      | USDT      |");
  console.log("-".repeat(80));
  wallets.forEach(w => {
    console.log(`| ${w.index.toString().padStart(2)} | ${w.address} | ${w.mntBalance.padStart(8)} | ${w.usdtBalance.padStart(9)} |`);
  });
  console.log("-".repeat(80));
  console.log("");

  console.log("🔒 IMPORTANT: Keep the JSON file secure!");
  console.log("   It contains private keys for all test wallets");
  console.log("");
  console.log("✅ Ready to test with multiple wallets!");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
