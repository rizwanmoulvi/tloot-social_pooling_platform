import { createWalletClient, createPublicClient, http, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mantleSepoliaTestnet } from 'viem/chains';

const POOL_MANAGER_ADDRESS = '0x033B233caD1b5Ec1CAf463031Ee33301c62C168d';
const PRIVATE_KEY = '0x454b41012668f26ce8aadb620ccf770a98a1f6e2b068ed0d44ea640395e9b8cf';
const POOL_ID = process.env.POOL_ID || '1';

const POOL_MANAGER_ABI = [
  {
    name: 'finalizePool',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'poolId', type: 'uint256' }],
    outputs: [],
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
  {
    name: 'getPoolWinners',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'poolId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address[]' }],
  },
  {
    name: 'getPoolParticipants',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'poolId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address[]' }],
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
  console.log('Finalizing pool:', POOL_ID, '\n');

  try {
    // Get pool info
    const pool = await publicClient.readContract({
      address: POOL_MANAGER_ADDRESS,
      abi: POOL_MANAGER_ABI,
      functionName: 'getPool',
      args: [BigInt(POOL_ID)],
    });

    console.log('Pool:', pool.eventName);
    console.log('Participants:', pool.totalParticipants.toString(), '/', pool.maxParticipants.toString());
    console.log('Total Pooled:', formatEther(pool.totalPooled), 'ETH');
    console.log('Winner Slots:', pool.winnerCount.toString());
    console.log('Status:', pool.status === 0 ? 'ACTIVE' : pool.status === 1 ? 'FILLING' : pool.status === 2 ? 'COMPLETED' : 'OTHER');
    console.log('Finalized:', pool.finalized);
    console.log();

    if (pool.finalized) {
      console.log('⚠️  Pool already finalized!\n');
      
      // Show winners
      const winners = await publicClient.readContract({
        address: POOL_MANAGER_ADDRESS,
        abi: POOL_MANAGER_ABI,
        functionName: 'getPoolWinners',
        args: [BigInt(POOL_ID)],
      });

      console.log('Winners:', winners.length);
      winners.forEach((winner, i) => {
        console.log(`  ${i + 1}. ${winner}`);
      });
      
      return;
    }

    // Get participants before finalization
    const participants = await publicClient.readContract({
      address: POOL_MANAGER_ADDRESS,
      abi: POOL_MANAGER_ABI,
      functionName: 'getPoolParticipants',
      args: [BigInt(POOL_ID)],
    });

    console.log('Participants:', participants.length);
    participants.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p}`);
    });
    console.log();

    // Finalize pool
    const hash = await walletClient.writeContract({
      address: POOL_MANAGER_ADDRESS,
      abi: POOL_MANAGER_ABI,
      functionName: 'finalizePool',
      args: [BigInt(POOL_ID)],
    });

    console.log('Transaction hash:', hash);
    console.log('Waiting for confirmation...\n');

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('✅ Pool finalized successfully!');
    console.log('Block:', receipt.blockNumber);
    console.log('Gas used:', receipt.gasUsed.toString());
    console.log('\nView on explorer:');
    console.log(`https://sepolia.mantlescan.xyz/tx/${hash}\n`);

    // Get winners
    const winners = await publicClient.readContract({
      address: POOL_MANAGER_ADDRESS,
      abi: POOL_MANAGER_ABI,
      functionName: 'getPoolWinners',
      args: [BigInt(POOL_ID)],
    });

    console.log('🎉 Winners Selected:', winners.length);
    winners.forEach((winner, i) => {
      console.log(`  ${i + 1}. ${winner}`);
    });
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
  }
}

main();
