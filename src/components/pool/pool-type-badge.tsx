"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { PoolType } from "@/lib/constants";
import { Sparkles, Users } from "lucide-react";

interface PoolTypeBadgeProps {
  type: PoolType;
}

export function PoolTypeBadge({ type }: PoolTypeBadgeProps) {
  if (type === PoolType.LUCKY_DRAW) {
    return (
      <Badge variant="default">
        <Sparkles size={12} style={{ marginRight: "4px" }} />
        Lucky Draw
      </Badge>
    );
  }

  return (
    <Badge variant="secondary">
      <Users size={12} style={{ marginRight: "4px" }} />
      Commit-to-Claim
    </Badge>
  );
}
