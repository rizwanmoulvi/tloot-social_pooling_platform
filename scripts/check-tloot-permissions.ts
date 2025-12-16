import { network } from "hardhat";
import { formatEther } from "viem";

/**
 * TLOOT Permission Management Script
 * 
 * PROBLEM: Pool contracts need to mint TLOOT tokens immediately when users join,
 * but the current PlatformToken contract only allows the owner to mint.
 * 
 * SOLUTIONS:
 * 
 * Option 1: Deploy PlatformTokenV2 (RECOMMENDED for Production)
 * - Deploy new TLOOT contract with AccessControl (PlatformTokenV2.sol)
 * - Grant MINTER_ROLE to both factory contracts
 * - Factories automatically grant MINTER_ROLE to newly created pools
 * - Most flexible and secure approach
 * 
 * Option 2: Use Current TLOOT with Ownership Transfer (TEMPORARY for MVP)
 * - Transfer TLOOT ownership to a proxy/wallet that can delegate
 * - Manually grant permissions as needed
 * - Quick fix but less scalable
 * 
 * Option 3: Pre-mint and Distribute (ALTERNATIVE)
 * - Modify pool contracts to receive pre-minted TLOOT
 * - Factories transfer TLOOT to pools on creation
 * - Requires holding large TLOOT reserves
 */

async function main() {
  console.log("🔐 TLOOT Permission Management\n");

  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();
  
  console.log("Deployer account:", deployer.account.address);
  const balance = await publicClient.getBalance({ address: deployer.account.address });
  console.log("Account balance:", formatEther(balance), "MNT\n");

  // Contract addresses
  const TLOOT_CURRENT = "0x0470FF2ee65F43799fe4459840723a912137eE59";
  const LUCKY_DRAW_FACTORY = "0xdaae34787bf7100b8f21bff2863b864a92c9878c";
  const COMMIT_TO_CLAIM_FACTORY = "0xf0dd58c8267e1ac2fdb0bd048bdb6e50672a3cc0";

  console.log("Current Setup:");
  console.log("- TLOOT Token:", TLOOT_CURRENT);
  console.log("- LuckyDrawFactory:", LUCKY_DRAW_FACTORY);
  console.log("- CommitToClaimFactory:", COMMIT_TO_CLAIM_FACTORY);
  console.log("");

  console.log("=" .repeat(60));
  console.log("OPTION 1: Deploy PlatformTokenV2 (RECOMMENDED)");
  console.log("=" .repeat(60));
  console.log("");
  console.log("Steps:");
  console.log("1. Deploy PlatformTokenV2 contract");
  console.log("2. Grant MINTER_ROLE to LuckyDrawFactory");
  console.log("3. Grant MINTER_ROLE to CommitToClaimFactory");
  console.log("4. Update frontend constants with new TLOOT address");
  console.log("");
  console.log("Benefits:");
  console.log("✓ Role-based access control");
  console.log("✓ Multiple minters supported");
  console.log("✓ Easy to add/remove permissions");
  console.log("✓ Production-ready architecture");
  console.log("");
  console.log("Command to deploy:");
  console.log("  npx hardhat run scripts/deploy-tloot-v2.ts --network mantleSepolia");
  console.log("");

  console.log("=" .repeat(60));
  console.log("OPTION 2: Transfer Current TLOOT Ownership (QUICK FIX)");
  console.log("=" .repeat(60));
  console.log("");
  console.log("Steps:");
  console.log("1. Transfer TLOOT ownership to LuckyDrawFactory");
  console.log("   OR");
  console.log("2. Transfer TLOOT ownership to a multi-sig wallet");
  console.log("3. Manually handle minting through owner");
  console.log("");
  console.log("Limitations:");
  console.log("✗ Only one owner (either factory or wallet)");
  console.log("✗ Pools created by factories still can't mint directly");
  console.log("✗ Not scalable for multiple pools");
  console.log("");
  console.log("Command to transfer (if choosing this option):");
  console.log("  npx hardhat run scripts/transfer-tloot-ownership.ts --network mantleSepolia");
  console.log("");

  console.log("=" .repeat(60));
  console.log("OPTION 3: Modify Pool Contracts (REDESIGN)");
  console.log("=" .repeat(60));
  console.log("");
  console.log("Steps:");
  console.log("1. Modify pool contracts to not call mint() directly");
  console.log("2. Add distributeRewards() function that factories call");
  console.log("3. Factories hold TLOOT and distribute to pools");
  console.log("");
  console.log("Limitations:");
  console.log("✗ Requires redeploying all pool contracts");
  console.log("✗ Factories need large TLOOT reserves");
  console.log("✗ Extra gas for transfers");
  console.log("");

  console.log("=" .repeat(60));
  console.log("RECOMMENDED ACTION");
  console.log("=" .repeat(60));
  console.log("");
  console.log("For Production: Deploy PlatformTokenV2 (Option 1)");
  console.log("For Quick MVP Testing: Use current setup with manual minting");
  console.log("");
  console.log("⚠️  Current Issue: Pool contracts will FAIL when trying to mint TLOOT");
  console.log("   because they don't have permission.");
  console.log("");
  console.log("Next Steps:");
  console.log("1. Choose an option above");
  console.log("2. Run the corresponding deployment/setup script");
  console.log("3. Test pool creation and joining");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
