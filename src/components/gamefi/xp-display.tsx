"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap } from "lucide-react";

interface XPDisplayProps {
  xp: number;
  level: number;
  className?: string;
}

export function XPDisplay({ xp, level, className }: XPDisplayProps) {
  const xpForCurrentLevel = (level - 1) * 100;
  const xpForNextLevel = level * 100;
  const xpProgress = xp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = (xpProgress / xpNeeded) * 100;

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-violet-600/20 p-2">
              <Zap className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Level {level}</p>
              <p className="text-xs text-zinc-400">
                {xpProgress} / {xpNeeded} XP
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-violet-400">{xp}</p>
            <p className="text-xs text-zinc-500">Total XP</p>
          </div>
        </div>
        <Progress value={progressPercentage} variant="default" showLabel />
      </CardContent>
    </Card>
  );
}
