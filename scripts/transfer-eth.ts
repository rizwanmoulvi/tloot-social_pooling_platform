import { createWalletClient, createPublicClient, http, parseEther, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mantleSepoliaTestnet } from 'viem/chains';

const FROM_KEY = '0x454b41012668f26ce8aadb620ccf770a98a1f6e2b068ed0d44ea640395e9b8cf';
const TO_ADDRESS = '0xe8c3Bb0ccD1E0e8105AAE4A5CcfF5BbdEB7B60e3'; // Second test account

async function main() {
  const account = privateKeyToAccount(FROM_KEY as `0x${string}`);
  
  const publicClient = createPublicClient({
    chain: mantleSepoliaTestnet,
    transport: http('https://rpc.sepolia.mantle.xyz'),
  });

  const walletClient = createWalletClient({
    account,
    chain: mantleSepoliaTestnet,
    transport: http('https://rpc.sepolia.mantle.xyz'),
  });

  console.log('From:', account.address);
  console.log('To:', TO_ADDRESS);
  console.log();

  // Check balances
  const balanceFrom = await publicClient.getBalance({ address: account.address });
  const balanceTo = await publicClient.getBalance({ address: TO_ADDRESS as `0x${string}` });

  console.log('From Balance:', formatEther(balanceFrom), 'MNT');
  console.log('To Balance:', formatEther(balanceTo), 'MNT');
  console.log();

  // Transfer 0.5 MNT
  const amount = parseEther('0.5');
  console.log('Transferring', formatEther(amount), 'MNT...\n');

  const hash = await walletClient.sendTransaction({
    to: TO_ADDRESS as `0x${string}`,
    value: amount,
  });

  console.log('Transaction hash:', hash);
  console.log('Waiting for confirmation...\n');

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log('✅ Transfer successful!');
  console.log('Block:', receipt.blockNumber);
  console.log('\nView on explorer:');
  console.log(`https://sepolia.mantlescan.xyz/tx/${hash}\n`);

  // Check new balances
  const newBalanceTo = await publicClient.getBalance({ address: TO_ADDRESS as `0x${string}` });
  console.log('New To Balance:', formatEther(newBalanceTo), 'MNT');
}

main();
