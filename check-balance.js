const { createPublicClient, http, formatEther } = require('viem');
const { mantleSepoliaTestnet } = require('viem/chains');

const POOL_MANAGER = "0x491e9d48ed1e97359652bf25d6af9bb0c455b7da";
const ABI = [
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

async function checkBalance(address) {
  const client = createPublicClient({
    chain: mantleSepoliaTestnet,
    transport: http("https://rpc.sepolia.mantle.xyz"),
  });

  const balance = await client.readContract({
    address: POOL_MANAGER,
    abi: ABI,
    functionName: 'balanceOf',
    args: [address],
  });

  console.log(`TLOOT Balance for ${address}: ${formatEther(balance)}`);
}

const address = process.argv[2];
if (!address) {
  console.log("Usage: node check-balance.js <address>");
  process.exit(1);
}

checkBalance(address);
