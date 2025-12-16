import { createWalletClient, createPublicClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mantleSepoliaTestnet } from 'viem/chains';

const POOL_MANAGER_ADDRESS = '0x033B233caD1b5Ec1CAf463031Ee33301c62C168d';
const PRIVATE_KEY = '0x454b41012668f26ce8aadb620ccf770a98a1f6e2b068ed0d44ea640395e9b8cf';

const POOL_MANAGER_ABI = [
  {
    name: 'createPool',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'eventName', type: 'string' },
      { name: 'eventDate', type: 'uint256' },
      { name: 'ticketPrice', type: 'uint256' },
      { name: 'entryAmount', type: 'uint256' },
      { name: 'maxParticipants', type: 'uint256' },
      { name: 'winnerCount', type: 'uint256' },
      { name: 'daysUntilDeadline', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'nextPoolId',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getPool',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'poolId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'eventName', type: 'string' },
          { name: 'eventDate', type: 'uint256' },
          { name: 'ticketPrice', type: 'uint256' },
          { name: 'entryAmount', type: 'uint256' },
          { name: 'maxParticipants', type: 'uint256' },
          { name: 'totalParticipants', type: 'uint256' },
          { name: 'winnerCount', type: 'uint256' },
          { name: 'poolDeadline', type: 'uint256' },
          { name: 'claimDeadline', type: 'uint256' },
          { name: 'poolType', type: 'uint8' },
          { name: 'status', type: 'uint8' },
          { name: 'totalPooled', type: 'uint256' },
          { name: 'finalized', type: 'bool' },
          { name: 'winnerIndices', type: 'uint256[]' },
          { name: 'createdAt', type: 'uint256' },
        ],
      },
    ],
  },
] as const;

async function main() {
  const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
  
  const publicClient = createPublicClient({
    chain: mantleSepoliaTestnet,
    transport: http('https://rpc.sepolia.mantle.xyz'),
  });

  const walletClient = createWalletClient({
    account,
    chain: mantleSepoliaTestnet,
    transport: http('https://rpc.sepolia.mantle.xyz'),
  });

  console.log('Admin Account:', account.address);
  console.log('Creating test pool...\n');

  // Pool parameters
  const eventDate = BigInt(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60); // 30 days from now
  const ticketPrice = parseEther('0.1'); // 0.1 ETH per ticket
  const entryAmount = parseEther('0.01'); // 0.01 ETH to enter
  const maxParticipants = 10n;
  const winnerCount = 2n;
  const daysUntilDeadline = 7n;

  try {
    // Check current nextPoolId
    const currentPoolId = await publicClient.readContract({
      address: POOL_MANAGER_ADDRESS,
      abi: POOL_MANAGER_ABI,
      functionName: 'nextPoolId',
    });
    console.log('Current nextPoolId:', currentPoolId.toString());

    // Create pool
    const hash = await walletClient.writeContract({
      address: POOL_MANAGER_ADDRESS,
      abi: POOL_MANAGER_ABI,
      functionName: 'createPool',
      args: [
        'Taylor Swift Eras Tour - Los Angeles',
        eventDate,
        ticketPrice,
        entryAmount,
        maxParticipants,
        winnerCount,
        daysUntilDeadline,
      ],
    });

    console.log('Transaction hash:', hash);
    console.log('Waiting for confirmation...\n');

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('✅ Pool created successfully!');
    console.log('Block:', receipt.blockNumber);
    console.log('Gas used:', receipt.gasUsed.toString());
    console.log('Pool ID:', currentPoolId.toString());
    console.log('\nView on explorer:');
    console.log(`https://sepolia.mantlescan.xyz/tx/${hash}\n`);

    // Read the created pool
    const pool = await publicClient.readContract({
      address: POOL_MANAGER_ADDRESS,
      abi: POOL_MANAGER_ABI,
      functionName: 'getPool',
      args: [currentPoolId],
    });

    console.log('Pool Details:');
    console.log('- Event:', pool.eventName);
    console.log('- Entry Amount:', (Number(pool.entryAmount) / 1e18).toFixed(4), 'ETH');
    console.log('- Max Participants:', pool.maxParticipants.toString());
    console.log('- Winners:', pool.winnerCount.toString());
    console.log('- Status:', pool.status === 0 ? 'ACTIVE' : 'OTHER');
    console.log('- Current Participants:', pool.totalParticipants.toString());
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
  }
}

main();
