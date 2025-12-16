"use client";

import React, { useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useUserStore } from "@/store/user-store";
import { motion } from "framer-motion";
import { 
  Wallet, 
  TrendingUp, 
  Coins, 
  Users, 
  Zap, 
  Gift, 
  ArrowUpRight,
  Sparkles,
  Shield,
  Star,
  ChevronRight
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function RewardsPage() {
  const { isConnected, address } = useAccount();
  const { user: storeUser, loadMockUser } = useUserStore();

  const MOCK_WALLET = "0xe8c3Bb0ccD1E0e8105AAE4A5CcfF5BbdEB7B60e3";
  const shouldShowMockData = address?.toLowerCase() === MOCK_WALLET.toLowerCase();

  useEffect(() => {
    if (isConnected && shouldShowMockData && !storeUser) {
      loadMockUser();
    }
  }, [isConnected, shouldShowMockData, storeUser, loadMockUser]);

  // Use mock data if wallet matches, otherwise empty state
  const user = shouldShowMockData && storeUser ? storeUser : {
    address: "",
    level: 1,
    xp: 0,
    reputation: 0,
    poolsJoined: 0,
    poolsWon: 0,
    tokenBalance: 0,
  };

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
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (!isConnected) {
    return (
      <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
        <div style={{ ...containerStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <EmptyState
            title="Connect Your Wallet"
            description="Please connect your wallet to view your rewards"
            icon={<Wallet style={{ width: 48, height: 48, color: "#999999" }} />}
          />
        </div>
      </div>
    );
  }

  const rewardSources = [
    {
      name: "Pool Participation",
      amount: shouldShowMockData && user ? 450 : 0,
      icon: Users,
      description: "Earned from joining pools",
      trend: shouldShowMockData ? "+12%" : "0%",
    },
    {
      name: "Yield Distribution",
      amount: shouldShowMockData && user ? 320 : 0,
      icon: TrendingUp,
      description: "Share of pooled fund yields",
      trend: shouldShowMockData ? "+8%" : "0%",
    },
    {
      name: "Claim Fee Redistribution",
      amount: shouldShowMockData && user ? 280 : 0,
      icon: Gift,
      description: "From defaulted payments",
      trend: shouldShowMockData ? "+5%" : "0%",
    },
  ];

  const tokenUtilities = [
    {
      title: "Pool Fee Discounts",
      description: "Use tokens to reduce entry fees by up to 20%",
      status: "Available",
      icon: Gift,
    },
    {
      title: "Priority Access",
      description: "Get early access to high-demand pools",
      status: "Available",
      icon: Star,
    },
    {
      title: "Commitment Collateral",
      description: "Use tokens as commitment in Commit-to-Claim pools",
      status: "Coming Soon",
      icon: Shield,
    },
    {
      title: "Governance Voting",
      description: "Vote on platform decisions and new features",
      status: "Future",
      icon: Sparkles,
    },
  ];

  const totalRewards = rewardSources.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div style={{ backgroundColor: "#ffffff", color: "#000000" }}>
      <div style={containerStyle}>
        {/* Header */}
        <motion.section
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          style={{ marginBottom: "64px" }}
        >
          <motion.div variants={fadeInUp}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#000000",
              color: "#ffffff",
              padding: "8px 16px",
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: "24px",
            }}>
              <Gift size={14} />
              Your Rewards
            </div>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            style={{
              fontSize: "clamp(32px, 6vw, 56px)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "16px",
              textTransform: "uppercase",
              letterSpacing: "-1px",
            }}
          >
            Token Balance &<br />
            <span style={{ color: "#666666" }}>Earnings Overview</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            style={{
              fontSize: "16px",
              color: "#666666",
              maxWidth: "500px",
              lineHeight: 1.7,
            }}
          >
            Track your TLOOT tokens earned through pool participation, yields, and platform rewards.
          </motion.p>
        </motion.section>

        {/* Main Balance Card */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: "64px" }}
        >
          <motion.div
            whileHover={{ scale: 1.01 }}
            style={{
              border: "3px solid #000000",
              padding: "48px",
              backgroundColor: "#000000",
              color: "#ffffff",
            }}
          >
            <div style={{ 
              display: "flex", 
              flexWrap: "wrap",
              alignItems: "center", 
              justifyContent: "space-between",
              gap: "32px",
            }}>
              <div>
                <p style={{ 
                  fontSize: "12px", 
                  textTransform: "uppercase", 
                  letterSpacing: "2px",
                  opacity: 0.7,
                  marginBottom: "8px",
                }}>
                  Total Balance
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                  <span style={{ fontSize: "64px", fontWeight: 800, lineHeight: 1 }}>
                    {formatNumber(user.tokenBalance)}
                  </span>
                  <span style={{ fontSize: "24px", fontWeight: 600, opacity: 0.7 }}>TLOOT</span>
                </div>
                <p style={{ 
                  marginTop: "12px",
                  fontSize: "14px",
                  opacity: 0.7,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}>
                  <TrendingUp size={16} />
                  +{totalRewards} earned this month
                </p>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <Button 
                  variant="outline" 
                  disabled
                  style={{
                    backgroundColor: "transparent",
                    color: "#ffffff",
                    border: "2px solid rgba(255,255,255,0.3)",
                  }}
                >
                  Transfer
                </Button>
                <Button
                  disabled
                  style={{
                    backgroundColor: "#ffffff",
                    color: "#000000",
                  }}
                >
                  Use Tokens
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Earnings Breakdown */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ marginBottom: "64px" }}
        >
          <h2 style={{ 
            fontSize: "24px", 
            fontWeight: 800, 
            textTransform: "uppercase", 
            letterSpacing: "1px",
            marginBottom: "32px",
          }}>
            Earnings Breakdown
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
          }}>
            {rewardSources.map((source, index) => {
              const Icon = source.icon;
              return (
                <motion.div
                  key={source.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  style={{
                    border: "2px solid #000000",
                    padding: "24px",
                    backgroundColor: "#ffffff",
                    cursor: "default",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ 
                    display: "flex", 
                    alignItems: "flex-start", 
                    justifyContent: "space-between",
                    marginBottom: "16px",
                  }}>
                    <div style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: "#000000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <Icon size={24} color="#ffffff" />
                    </div>
                    <span style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#22c55e",
                      backgroundColor: "#dcfce7",
                      padding: "4px 8px",
                    }}>
                      {source.trend}
                    </span>
                  </div>
                  <h3 style={{ 
                    fontSize: "16px", 
                    fontWeight: 700, 
                    marginBottom: "4px",
                  }}>
                    {source.name}
                  </h3>
                  <p style={{ 
                    fontSize: "13px", 
                    color: "#666666",
                    marginBottom: "16px",
                  }}>
                    {source.description}
                  </p>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "baseline", 
                    gap: "8px",
                    paddingTop: "16px",
                    borderTop: "1px solid #e5e5e5",
                  }}>
                    <span style={{ fontSize: "28px", fontWeight: 800 }}>
                      +{formatNumber(source.amount)}
                    </span>
                    <span style={{ fontSize: "14px", color: "#666666", fontWeight: 600 }}>
                      TLOOT
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Token Utilities */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ marginBottom: "64px" }}
        >
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "12px",
            marginBottom: "32px",
          }}>
            <Sparkles size={24} />
            <h2 style={{ 
              fontSize: "24px", 
              fontWeight: 800, 
              textTransform: "uppercase", 
              letterSpacing: "1px",
            }}>
              Token Utilities
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
          }}>
            {tokenUtilities.map((utility, index) => {
              const Icon = utility.icon;
              const isAvailable = utility.status === "Available";
              return (
                <motion.div
                  key={utility.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={isAvailable ? { scale: 1.02, y: -4 } : {}}
                  style={{
                    border: "2px solid #000000",
                    padding: "24px",
                    backgroundColor: isAvailable ? "#ffffff" : "#f9f9f9",
                    opacity: isAvailable ? 1 : 0.7,
                    cursor: isAvailable ? "pointer" : "default",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ 
                    display: "flex", 
                    alignItems: "flex-start", 
                    justifyContent: "space-between",
                    marginBottom: "16px",
                  }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: isAvailable ? "#000000" : "#cccccc",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <Icon size={20} color="#ffffff" />
                    </div>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      color: isAvailable ? "#000000" : "#666666",
                      backgroundColor: isAvailable ? "#f0f0f0" : "transparent",
                      padding: "4px 8px",
                      border: isAvailable ? "none" : "1px solid #cccccc",
                    }}>
                      {utility.status}
                    </span>
                  </div>
                  <h3 style={{ 
                    fontSize: "16px", 
                    fontWeight: 700, 
                    marginBottom: "8px",
                  }}>
                    {utility.title}
                  </h3>
                  <p style={{ 
                    fontSize: "14px", 
                    color: "#666666",
                    lineHeight: 1.5,
                  }}>
                    {utility.description}
                  </p>
                  {isAvailable && (
                    <div style={{
                      marginTop: "16px",
                      paddingTop: "16px",
                      borderTop: "1px solid #e5e5e5",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}>
                      Use Now <ChevronRight size={16} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* How to Earn More */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div style={{
            border: "2px solid #000000",
            backgroundColor: "#fafafa",
          }}>
            <div style={{
              padding: "24px 32px",
              borderBottom: "2px solid #000000",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}>
              <ArrowUpRight size={24} />
              <h2 style={{ 
                fontSize: "20px", 
                fontWeight: 800, 
                textTransform: "uppercase", 
                letterSpacing: "1px",
              }}>
                How to Earn More Tokens
              </h2>
            </div>
            <div style={{ padding: "32px" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "24px",
              }}>
                {[
                  { num: "01", text: "Join more pools to increase participation rewards" },
                  { num: "02", text: "Idle pool funds automatically generate yield returns" },
                  { num: "03", text: "Non-winners always receive consolation tokens" },
                  { num: "04", text: "Maintain good reputation to earn bonus multipliers" },
                  { num: "05", text: "Complete payment streaks for additional rewards" },
                ].map((tip) => (
                  <div key={tip.num} style={{ display: "flex", gap: "16px" }}>
                    <span style={{
                      fontSize: "32px",
                      fontWeight: 800,
                      color: "#e5e5e5",
                      lineHeight: 1,
                    }}>
                      {tip.num}
                    </span>
                    <p style={{
                      fontSize: "14px",
                      color: "#333333",
                      lineHeight: 1.6,
                      paddingTop: "4px",
                    }}>
                      {tip.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
