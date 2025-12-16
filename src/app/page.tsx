"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, TrendingUp, Users, Ticket, ArrowRight } from "lucide-react";
import { PoolGrid } from "@/components/pool/pool-grid";
import { Button } from "@/components/ui/button";
import { usePoolStore } from "@/store/pool-store";
import { PoolType } from "@/lib/constants";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  const { pools, loadPools, isLoading } = usePoolStore();
  const [selectedTab, setSelectedTab] = useState<"all" | PoolType>("all");

  useEffect(() => {
    loadPools();
  }, [loadPools]);

  const filteredPools = selectedTab === "all"
    ? pools.filter((p) => p.status === "ACTIVE" || p.status === "FILLING")
    : pools.filter((p) => p.type === selectedTab && (p.status === "ACTIVE" || p.status === "FILLING"));

  const containerStyle: React.CSSProperties = {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "64px 24px",
    minHeight: "100vh",
    backgroundColor: "#ffffff",
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div style={{ backgroundColor: "#ffffff", color: "#000000" }}>
      <div style={containerStyle}>
        {/* Hero Section */}
        <motion.section
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          style={{ textAlign: "center", marginBottom: "80px" }}
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} style={{ display: "inline-block", marginBottom: "32px" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#000000",
              color: "#ffffff",
              padding: "12px 24px",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}>
              <Sparkles size={16} />
              GameFi meets Real-World Events
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            style={{
              fontSize: "clamp(36px, 8vw, 72px)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "24px",
              textTransform: "uppercase",
              letterSpacing: "-1px",
            }}
          >
            Access Event Tickets<br />
            <span style={{ color: "#666666" }}>Through Social Pools</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            style={{
              fontSize: "18px",
              color: "#666666",
              maxWidth: "600px",
              margin: "0 auto 40px",
              lineHeight: 1.7,
            }}
          >
            Pool funds with others, participate in chance-based games, and earn token rewards
            while accessing high-value event tickets at reduced upfront costs.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px", marginBottom: "64px" }}
          >
            <Link href="/pools">
              <Button size="lg">
                <Ticket size={20} style={{ marginRight: "8px" }} />
                Browse Pools
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Learn How It Works
              <ArrowRight size={20} style={{ marginLeft: "8px" }} />
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeInUp}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "24px",
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            {[
              { value: pools.length, label: "Active Pools" },
              { value: pools.reduce((sum, p) => sum + p.currentParticipants, 0), label: "Participants" },
              { value: `$${pools.reduce((sum, p) => sum + p.currentAmount, 0).toLocaleString()}`, label: "Total Pooled" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
                style={{
                  padding: "32px",
                  border: "2px solid #000000",
                  backgroundColor: "#ffffff",
                  transition: "all 0.2s ease",
                }}
              >
                <p style={{ fontSize: "36px", fontWeight: 800, marginBottom: "8px" }}>{stat.value}</p>
                <p style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 600, letterSpacing: "1px", color: "#666666" }}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Pool Type Tabs */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ marginBottom: "32px" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>
              Explore Pools
            </h2>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "40px" }}>
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

          {/* Pool Grid */}
          <PoolGrid pools={filteredPools} isLoading={isLoading} />
        </motion.section>

        {/* How It Works */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{ marginTop: "80px" }}
        >
          <h2 style={{ fontSize: "28px", fontWeight: 800, textAlign: "center", marginBottom: "48px", textTransform: "uppercase" }}>
            How It Works
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
            {/* Lucky Draw */}
            <motion.div
              whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.1)" }}
              style={{
                padding: "32px",
                border: "2px solid #000000",
                backgroundColor: "#ffffff",
                transition: "all 0.3s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div style={{ backgroundColor: "#000000", padding: "12px", display: "inline-flex" }}>
                  <Sparkles size={24} color="#ffffff" />
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: 700 }}>Lucky Draw Pools</h3>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  "Contribute a small fixed amount to join",
                  "Each contribution = one entry in the draw",
                  "Winners selected randomly when pool completes",
                  "Winners pay 20% claim fee, non-winners get tokens",
                ].map((item, i) => (
                  <li key={i} style={{ display: "flex", gap: "12px", fontSize: "14px", color: "#444444" }}>
                    <span style={{ fontWeight: 700, color: "#000000" }}>{i + 1}.</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Commit-to-Claim */}
            <motion.div
              whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.1)" }}
              style={{
                padding: "32px",
                border: "2px solid #000000",
                backgroundColor: "#f8f8f8",
                transition: "all 0.3s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div style={{ backgroundColor: "#000000", padding: "12px", display: "inline-flex" }}>
                  <Users size={24} color="#ffffff" />
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: 700 }}>Commit-to-Claim Pools</h3>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  "Reserve ticket with small commitment amount",
                  "Pool fills and tickets are reserved",
                  "Complete full payment before deadline",
                  "Ticket issued on payment, or commitment slashed",
                ].map((item, i) => (
                  <li key={i} style={{ display: "flex", gap: "12px", fontSize: "14px", color: "#444444" }}>
                    <span style={{ fontWeight: 700, color: "#000000" }}>{i + 1}.</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
