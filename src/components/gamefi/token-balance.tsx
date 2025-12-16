"use client";

import React from "react";
import { Coins } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface TokenBalanceProps {
  balance: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function TokenBalance({
  balance,
  size = "md",
  showLabel = true,
  className,
}: TokenBalanceProps) {
  const sizes = {
    sm: { icon: "h-4 w-4", text: "text-lg", label: "text-xs" },
    md: { icon: "h-5 w-5", text: "text-2xl", label: "text-sm" },
    lg: { icon: "h-6 w-6", text: "text-3xl", label: "text-base" },
  };

  const sizeClasses = sizes[size];

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <div className="rounded-full bg-violet-600/20 p-2">
          <Coins className={`${sizeClasses.icon} text-violet-400`} />
        </div>
        <div>
          <p className={`${sizeClasses.text} font-bold text-violet-400`}>
            {formatNumber(balance)}
          </p>
          {showLabel && (
            <p className={`${sizeClasses.label} text-zinc-400`}>TKT Tokens</p>
          )}
        </div>
      </div>
    </div>
  );
}
