import { createWalletClient, createPublicClient, http, parseEther, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mantleSepoliaTestnet } from 'viem/chains';
import { generatePrivateKey } from 'viem/accounts';

const POOL_MANAGER_ADDRESS = '0x033B233caD1b5Ec1CAf463031Ee33301c62C168d';
const TOKEN_ADDRESS = '0x49dF9F4cAd99381847ACB5362E8e6E3914e79912';
const ADMIN_KEY = '0x454b41012668f26ce8aadb620ccf770a98a1f6e2b068ed0d44ea640395e9b8cf';
const POOL_ID = '1';

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
] as const;

async function main() {
  const adminAccount = privateKeyToAccount(ADMIN_KEY as `0x${string}`);
  
  const publicClient = createPublicClient({
    chain: mantleSepoliaTestnet,
    transport: http('https://rpc.sepolia.mantle.xyz'),
  });

  // Get pool info
  const pool = await publicClient.readContract({
    address: POOL_MANAGER_ADDRESS,
    abi: POOL_MANAGER_ABI,
    functionName: 'getPool',
    args: [BigInt(POOL_ID)],
  });

  console.log('Pool:', pool.eventName);
  console.log('Current:', pool.totalParticipants.toString(), '/', pool.maxParticipants.toString());
  console.log('Need:', (Number(pool.maxParticipants) - Number(pool.totalParticipants)), 'more participants\n');

  const needed = Number(pool.maxParticipants) - Number(pool.totalParticipants);
  
  for (let i = 0; i < needed; i++) {
    // Generate a new test account
    const testKey = generatePrivateKey();
    const testAccount = privateKeyToAccount(testKey);
    
    console.log(`[${i + 1}/${needed}] Account:`, testAccount.address);

    // Create wallet client for admin to fund test account
    const adminWallet = createWalletClient({
      account: adminAccount,
      chain: mantleSepoliaTestnet,
      transport: http('https://rpc.sepolia.mantle.xyz'),
    });

    // Fund with 0.05 MNT (enough for entry + gas)
    const fundHash = await adminWallet.sendTransaction({
      to: testAccount.address,
      value: parseEther('0.05'),
    });
    await publicClient.waitForTransactionReceipt({ hash: fundHash });
    console.log('  ✓ Funded');

    // Join pool with test account
    const testWallet = createWalletClient({
      account: testAccount,
      chain: mantleSepoliaTestnet,
      transport: http('https://rpc.sepolia.mantle.xyz'),
    });

    const joinHash = await testWallet.writeContract({
      address: POOL_MANAGER_ADDRESS,
      abi: POOL_MANAGER_ABI,
      functionName: 'joinPool',
      args: [BigInt(POOL_ID)],
      value: pool.entryAmount,
    });
    await publicClient.waitForTransactionReceipt({ hash: joinHash });
    console.log('  ✓ Joined pool');
    console.log('  Tx:', `https://sepolia.mantlescan.xyz/tx/${joinHash}\n`);
  }

  // Get final pool state
  const finalPool = await publicClient.readContract({
    address: POOL_MANAGER_ADDRESS,
    abi: POOL_MANAGER_ABI,
    functionName: 'getPool',
    args: [BigInt(POOL_ID)],
  });

  console.log('✅ Pool is now FULL!');
  console.log('Total Participants:', finalPool.totalParticipants.toString());
  console.log('Status:', finalPool.status === 1 ? 'FILLING (Ready to finalize)' : 'ACTIVE');
}

main();
