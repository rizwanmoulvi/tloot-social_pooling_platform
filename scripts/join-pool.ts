import { createWalletClient, createPublicClient, http, parseEther, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mantleSepoliaTestnet } from 'viem/chains';

const POOL_MANAGER_ADDRESS = '0x033B233caD1b5Ec1CAf463031Ee33301c62C168d';
const TOKEN_ADDRESS = '0x49dF9F4cAd99381847ACB5362E8e6E3914e79912';
const PRIVATE_KEY = process.env.TEST_PRIVATE_KEY || '0x4b65097542a5c9df2203f2a14d1ddb075877ddcfca67dd4e3da1f6bc833c5efd';
const POOL_ID = process.env.POOL_ID || '1';

const POOL_MANAGER_ABI = [
  {
    name: 'joinPool',
    type: 'function',
    stateMutability: 'payable',
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
    name: 'getParticipation',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'poolId', type: 'uint256' },
      { name: 'user', type: 'address' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'participant', type: 'address' },
          { name: 'poolId', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
          { name: 'isWinner', type: 'bool' },
          { name: 'hasClaimed', type: 'bool' },
          { name: 'hasReceivedReward', type: 'bool' },
          { name: 'joinedAt', type: 'uint256' },
        ],
      },
    ],
  },
] as const;

const TOKEN_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
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

  console.log('User Account:', account.address);
  console.log('Joining pool:', POOL_ID, '\n');

  try {
    // Get pool info
    const pool = await publicClient.readContract({
      address: POOL_MANAGER_ADDRESS,
      abi: POOL_MANAGER_ABI,
      functionName: 'getPool',
      args: [BigInt(POOL_ID)],
    });

    console.log('Pool:', pool.eventName);
    console.log('Entry Amount:', formatEther(pool.entryAmount), 'ETH');
    console.log('Current Participants:', pool.totalParticipants.toString(), '/', pool.maxParticipants.toString());
    console.log('Status:', pool.status === 0 ? 'ACTIVE' : pool.status === 1 ? 'FILLING' : 'OTHER');
    console.log();

    // Check current token balance
    const tokenBalanceBefore = await publicClient.readContract({
      address: TOKEN_ADDRESS,
      abi: TOKEN_ABI,
      functionName: 'balanceOf',
      args: [account.address],
    });
    console.log('TKT Balance Before:', formatEther(tokenBalanceBefore));

    // Join pool
    const hash = await walletClient.writeContract({
      address: POOL_MANAGER_ADDRESS,
      abi: POOL_MANAGER_ABI,
      functionName: 'joinPool',
      args: [BigInt(POOL_ID)],
      value: pool.entryAmount,
    });

    console.log('\nTransaction hash:', hash);
    console.log('Waiting for confirmation...\n');

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('✅ Joined pool successfully!');
    console.log('Block:', receipt.blockNumber);
    console.log('Gas used:', receipt.gasUsed.toString());
    console.log('\nView on explorer:');
    console.log(`https://sepolia.mantlescan.xyz/tx/${hash}\n`);

    // Check participation
    const participation = await publicClient.readContract({
      address: POOL_MANAGER_ADDRESS,
      abi: POOL_MANAGER_ABI,
      functionName: 'getParticipation',
      args: [BigInt(POOL_ID), account.address],
    });

    console.log('Participation Details:');
    console.log('- Amount:', formatEther(participation.amount), 'ETH');
    console.log('- Joined At:', new Date(Number(participation.joinedAt) * 1000).toISOString());

    // Check new token balance
    const tokenBalanceAfter = await publicClient.readContract({
      address: TOKEN_ADDRESS,
      abi: TOKEN_ABI,
      functionName: 'balanceOf',
      args: [account.address],
    });
    const reward = tokenBalanceAfter - tokenBalanceBefore;
    console.log('\nTKT Balance After:', formatEther(tokenBalanceAfter));
    console.log('🎁 Participation Reward:', formatEther(reward), 'TKT');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
  }
}

main();
