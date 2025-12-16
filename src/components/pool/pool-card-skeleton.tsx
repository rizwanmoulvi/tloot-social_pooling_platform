"use client";

import React from "react";
import { motion } from "framer-motion";

export function PoolCardSkeleton() {
  const shimmer = {
    initial: { opacity: 0.5 },
    animate: { opacity: 1 },
    transition: { duration: 0.8, repeat: Infinity, repeatType: "reverse" as const },
  };

  const skeletonBarStyle: React.CSSProperties = {
    backgroundColor: "#e5e5e5",
    borderRadius: "2px",
  };

  return (
    <div style={{
      backgroundColor: "#ffffff",
      border: "2px solid #e5e5e5",
      overflow: "hidden",
    }}>
      {/* Image Skeleton */}
      <motion.div
        {...shimmer}
        style={{
          height: "220px",
          width: "100%",
          backgroundColor: "#f0f0f0",
        }}
      />

      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Event Info Skeleton */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <motion.div {...shimmer} style={{ ...skeletonBarStyle, height: "16px", width: "75%" }} />
          <motion.div {...shimmer} style={{ ...skeletonBarStyle, height: "16px", width: "50%" }} />
        </div>

        {/* Progress Skeleton */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <motion.div {...shimmer} style={{ ...skeletonBarStyle, height: "12px", width: "100%" }} />
          <motion.div {...shimmer} style={{ ...skeletonBarStyle, height: "4px", width: "100%" }} />
        </div>

        {/* Stats Skeleton */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <motion.div {...shimmer} style={{ ...skeletonBarStyle, height: "16px", width: "80px" }} />
          <motion.div {...shimmer} style={{ ...skeletonBarStyle, height: "16px", width: "64px" }} />
        </div>

        {/* Button Skeleton */}
        <motion.div {...shimmer} style={{ ...skeletonBarStyle, height: "48px", width: "100%", marginTop: "8px" }} />
      </div>
    </div>
  );
}
