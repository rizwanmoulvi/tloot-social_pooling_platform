import { network } from "hardhat";

const MOCK_USDT = "0x59a2fB83F0f92480702EDEE8f84c72a1eF44BD9b";

async function main() {
  console.log("🚀 Deploying Simple Pool Manager to Mantle Sepolia...\n");

  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  console.log("Deploying with account:", deployer.account.address);
  const balance = await publicClient.getBalance({ address: deployer.account.address });
  console.log("Account balance:", Number(balance) / 10**18, "MNT\n");

  // Deploy SimplePoolManager
  console.log("📦 Deploying SimplePoolManager...");
  const poolManager = await viem.deployContract("SimplePoolManager", [MOCK_USDT]);
  console.log("✅ SimplePoolManager deployed to:", poolManager.address);
  console.log("");

  // Get TLOOT info
  const name = await publicClient.readContract({
    address: poolManager.address,
    abi: poolManager.abi,
    functionName: 'name',
  });
  
  const symbol = await publicClient.readContract({
    address: poolManager.address,
    abi: poolManager.abi,
    functionName: 'symbol',
  });
  
  const totalSupply = await publicClient.readContract({
    address: poolManager.address,
    abi: poolManager.abi,
    functionName: 'totalSupply',
  });

  console.log("=" .repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE");
  console.log("=" .repeat(60));
  console.log("");
  console.log("Contract Address:", poolManager.address);
  console.log("TLOOT Token:", name, "(", symbol, ")");
  console.log("Initial Supply:", Number(totalSupply) / 10**18, "TLOOT");
  console.log("");
  console.log("⚠️  Update frontend constant:");
  console.log("   POOL_MANAGER:", poolManager.address);
  console.log("");
  console.log("✅ Everything in ONE contract!");
  console.log("✅ Built-in TLOOT token (Aave-style minting)");
  console.log("✅ No factories, no complexity");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
