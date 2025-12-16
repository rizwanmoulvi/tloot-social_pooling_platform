import { network } from "hardhat";

const TLOOT = "0xb1a293a3c6c43f0718c313d892720ed913539140";
const LD_FACTORY = "0xdbe2ebb830822d742ab1f8c293d1809dfcdae560";
const CTC_FACTORY = "0xcfc2d3461f25f90cd5422f26186b8809e32acb6f";

const TLOOT_ABI = [
  {
    "inputs": [],
    "name": "ADMIN_ROLE",
    "outputs": [{"name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "role", "type": "bytes32"}, {"name": "account", "type": "address"}],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "role", "type": "bytes32"}, {"name": "account", "type": "address"}],
    "name": "hasRole",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
];

async function main() {
  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  console.log("Granting ADMIN_ROLE to factories...\n");

  // Get ADMIN_ROLE
  const ADMIN_ROLE = await publicClient.readContract({
    address: TLOOT as `0x${string}`,
    abi: TLOOT_ABI,
    functionName: 'ADMIN_ROLE',
  });

  console.log("ADMIN_ROLE:", ADMIN_ROLE);
  console.log("");

  // Grant to LuckyDrawFactory
  console.log("Granting to LuckyDrawFactory...");
  const hash1 = await deployer.writeContract({
    address: TLOOT as `0x${string}`,
    abi: TLOOT_ABI,
    functionName: 'grantRole',
    args: [ADMIN_ROLE, LD_FACTORY],
    account: deployer.account,
  });
  await publicClient.waitForTransactionReceipt({ hash: hash1 });
  console.log("✅ Done");
  console.log("");

  // Grant to CommitToClaimFactory
  console.log("Granting to CommitToClaimFactory...");
  const hash2 = await deployer.writeContract({
    address: TLOOT as `0x${string}`,
    abi: TLOOT_ABI,
    functionName: 'grantRole',
    args: [ADMIN_ROLE, CTC_FACTORY],
    account: deployer.account,
  });
  await publicClient.waitForTransactionReceipt({ hash: hash2 });
  console.log("✅ Done");
  console.log("");

  // Verify
  const hasLd = await publicClient.readContract({
    address: TLOOT as `0x${string}`,
    abi: TLOOT_ABI,
    functionName: 'hasRole',
    args: [ADMIN_ROLE, LD_FACTORY],
  });

  const hasCtc = await publicClient.readContract({
    address: TLOOT as `0x${string}`,
    abi: TLOOT_ABI,
    functionName: 'hasRole',
    args: [ADMIN_ROLE, CTC_FACTORY],
  });

  console.log("Verification:");
  console.log("- LuckyDrawFactory has ADMIN_ROLE:", hasLd);
  console.log("- CommitToClaimFactory has ADMIN_ROLE:", hasCtc);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
