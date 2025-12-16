"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, TrendingUp, Users, Search, Plus } from "lucide-react";
import { PoolGrid } from "@/components/pool/pool-grid";
import { Button } from "@/components/ui/button";
import { usePoolStore } from "@/store/pool-store";
import { PoolType } from "@/lib/constants";
import { motion } from "framer-motion";

export default function PoolsPage() {
  const { pools, loadPools, isLoading } = usePoolStore();
  const [selectedTab, setSelectedTab] = useState<"all" | PoolType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadPools();
  }, [loadPools]);

  const filteredPools = pools.filter((p) => {
    // Filter by tab
    if (selectedTab !== "all" && p.type !== selectedTab) return false;
    
    // Filter by status
    if (p.status !== "ACTIVE" && p.status !== "FILLING") return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        p.event.name.toLowerCase().includes(query) ||
        p.event.venue.toLowerCase().includes(query) ||
        p.event.category.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const containerStyle: React.CSSProperties = {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "48px 24px",
    minHeight: "100vh",
    backgroundColor: "#ffffff",
  };

  return (
    <div style={{ backgroundColor: "#ffffff", color: "#000000" }}>
      <div style={containerStyle}>
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: "48px" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{
                fontSize: "40px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "12px",
              }}>
                Browse Pools
              </h1>
              <p style={{ fontSize: "16px", color: "#666666", maxWidth: "600px" }}>
                Join event pools to access premium tickets at reduced costs. Choose from Lucky Draw or Commit-to-Claim pools.
              </p>
            </div>
            <Link href="/pools/create">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "14px 24px",
                  fontSize: "14px",
                  fontWeight: 700,
                  border: "3px solid #000000",
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                <Plus size={18} />
                Create Pool
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          {/* Search Input */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            border: "2px solid #000000",
            backgroundColor: "#ffffff",
            maxWidth: "400px",
          }}>
            <Search size={20} color="#666666" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "14px",
                backgroundColor: "transparent",
              }}
            />
          </div>

          {/* Filter Tabs */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {[
              { key: "all", label: "All Pools", icon: TrendingUp },
              { key: PoolType.LUCKY_DRAW, label: "Lucky Draw", icon: Sparkles },
              { key: PoolType.COMMIT_TO_CLAIM, label: "Commit-to-Claim", icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedTab === tab.key;
              return (
                <motion.button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key as "all" | PoolType)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    fontSize: "14px",
                    fontWeight: 600,
                    border: "2px solid #000000",
                    backgroundColor: isActive ? "#000000" : "#ffffff",
                    color: isActive ? "#ffffff" : "#000000",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            marginBottom: "24px",
            fontSize: "14px",
            color: "#666666",
            fontWeight: 600,
          }}
        >
          {filteredPools.length} pool{filteredPools.length !== 1 ? "s" : ""} found
        </motion.div>

        {/* Pool Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PoolGrid pools={filteredPools} isLoading={isLoading} />
        </motion.div>
      </div>
    </div>
  );
}
