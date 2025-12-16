import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatTokenAmount(amount: bigint, decimals: number = 18): string {
  const value = Number(amount) / Math.pow(10, decimals);
  return formatNumber(value);
}

export function parseTokenAmount(amount: string, decimals: number = 18): bigint {
  const value = parseFloat(amount) * Math.pow(10, decimals);
  return BigInt(Math.floor(value));
}
