"use client";

import React from "react";
import { PoolCard } from "./pool-card";
import { PoolCardSkeleton } from "./pool-card-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Pool } from "@/types";
import { Inbox } from "lucide-react";
import { motion } from "framer-motion";

interface PoolGridProps {
  pools: Pool[];
  isLoading?: boolean;
}

export function PoolGrid({ pools, isLoading }: PoolGridProps) {
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "24px",
  };

  if (isLoading) {
    return (
      <div style={gridStyle}>
        {Array.from({ length: 6 }).map((_, i) => (
          <PoolCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (pools.length === 0) {
    return (
      <EmptyState
        title="No pools found"
        description="Check back later for new exciting event pools!"
        icon={<Inbox size={40} color="#999999" />}
      />
    );
  }

  return (
    <div style={gridStyle}>
      {pools.map((pool, index) => (
        <motion.div
          key={pool.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
        >
          <PoolCard pool={pool} />
        </motion.div>
      ))}
    </div>
  );
}
