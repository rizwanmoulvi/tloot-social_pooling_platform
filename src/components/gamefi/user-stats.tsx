"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Trophy, Users, Coins } from "lucide-react";

interface UserStatsProps {
  reputation: number;
  poolsJoined: number;
  poolsWon: number;
  tokenBalance: number;
  className?: string;
}

export function UserStats({
  reputation,
  poolsJoined,
  poolsWon,
  tokenBalance,
  className,
}: UserStatsProps) {
  const winRate = poolsJoined > 0 ? ((poolsWon / poolsJoined) * 100).toFixed(1) : "0";

  const stats = [
    {
      label: "Reputation",
      value: reputation,
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-600/20",
    },
    {
      label: "Pools Joined",
      value: poolsJoined,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-600/20",
    },
    {
      label: "Pools Won",
      value: poolsWon,
      icon: Trophy,
      color: "text-yellow-400",
      bgColor: "bg-yellow-600/20",
    },
    {
      label: "Token Balance",
      value: tokenBalance,
      icon: Coins,
      color: "text-violet-400",
      bgColor: "bg-violet-600/20",
    },
  ];

  return (
    <div className={className}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg ${stat.bgColor} p-2`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-zinc-400">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {poolsJoined > 0 && (
        <Card className="mt-4">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-sm text-zinc-400">Win Rate</span>
            <span className="text-xl font-bold text-violet-400">{winRate}%</span>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
