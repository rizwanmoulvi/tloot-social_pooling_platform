"use client";

import React, { useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PoolCard } from "@/components/pool/pool-card";
import { useUserStore } from "@/store/user-store";
import { motion } from "framer-motion";
import { 
  Wallet, 
  TrendingUp, 
  Trophy, 
  Users, 
  Coins, 
  Zap,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { isConnected, address } = useAccount();
  const { user: storeUser, participations: storeParticipations, loadMockUser } = useUserStore();

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

  const participations = shouldShowMockData ? storeParticipations : [];

  const activeParticipations = participations.filter((p) => p.status === "JOINED");
  const wonParticipations = participations.filter((p) => p.status === "WON" || p.status === "CLAIMED");
  const lostParticipations = participations.filter((p) => p.status === "LOST");
  const pendingPayments = participations.filter((p) => p.status === "PENDING_PAYMENT");

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
            description="Please connect your wallet to view your dashboard"
            icon={<Wallet style={{ width: 48, height: 48, color: "#999999" }} />}
          />
        </div>
      </div>
    );
  }

  const winRate = "0";

  // XP calculation
  const xpForCurrentLevel = 0;
  const xpForNextLevel = 100;
  const xpProgress = 0;
  const xpNeeded = 100;
  const progressPercentage = 0;

  const stats = [
    { 
      label: "Reputation", 
      value: user.reputation, 
      icon: TrendingUp,
      suffix: "/100",
      color: "#22c55e",
    },
    { 
      label: "Pools Joined", 
      value: user.poolsJoined, 
      icon: Users,
      suffix: "",
      color: "#3b82f6",
    },
    { 
      label: "Pools Won", 
      value: user.poolsWon, 
      icon: Trophy,
      suffix: "",
      color: "#eab308",
    },
    { 
      label: "Token Balance", 
      value: user.tokenBalance, 
      icon: Coins,
      suffix: " TLOOT",
      color: "#8b5cf6",
    },
  ];

  return (
    <div style={{ backgroundColor: "#ffffff", color: "#000000" }}>
      <div style={containerStyle}>
        {/* Header */}
        <motion.section
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          style={{ marginBottom: "48px" }}
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
              <Target size={14} />
              Your Dashboard
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
            Track Your<br />
            <span style={{ color: "#666666" }}>Progress & Pools</span>
          </motion.h1>
        </motion.section>

        {/* XP & Level Card */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: "32px" }}
        >
          <motion.div
            whileHover={{ scale: 1.005 }}
            style={{
              border: "3px solid #000000",
              padding: "32px",
              backgroundColor: "#000000",
              color: "#ffffff",
            }}
          >
            <div style={{ 
              display: "flex", 
              flexWrap: "wrap",
              alignItems: "center", 
              justifyContent: "space-between",
              gap: "24px",
              marginBottom: "24px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{
                  width: "64px",
                  height: "64px",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Zap size={32} color="#000000" />
                </div>
                <div>
                  <p style={{ 
                    fontSize: "12px", 
                    textTransform: "uppercase", 
                    letterSpacing: "2px",
                    opacity: 0.7,
                    marginBottom: "4px",
                  }}>
                    Current Level
                  </p>
                  <p style={{ fontSize: "48px", fontWeight: 800, lineHeight: 1 }}>
                    {user.level}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ 
                  fontSize: "12px", 
                  textTransform: "uppercase", 
                  letterSpacing: "2px",
                  opacity: 0.7,
                  marginBottom: "4px",
                }}>
                  Total XP
                </p>
                <p style={{ fontSize: "36px", fontWeight: 800, lineHeight: 1 }}>
                  {user.xp}
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div style={{ marginBottom: "8px" }}>
              <div style={{
                height: "8px",
                backgroundColor: "rgba(255,255,255,0.2)",
                overflow: "hidden",
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  style={{
                    height: "100%",
                    backgroundColor: "#ffffff",
                  }}
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", opacity: 0.7 }}>
              <span>{xpProgress} XP</span>
              <span>{xpNeeded} XP to Level {user.level + 1}</span>
            </div>
          </motion.div>
        </motion.section>

        {/* Stats Grid */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ marginBottom: "48px" }}
        >
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  style={{
                    border: "2px solid #000000",
                    padding: "24px",
                    backgroundColor: "#ffffff",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#000000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}>
                    <Icon size={20} color="#ffffff" />
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                    <span style={{ fontSize: "32px", fontWeight: 800 }}>
                      {stat.value}
                    </span>
                    <span style={{ fontSize: "14px", color: "#666666" }}>
                      {stat.suffix}
                    </span>
                  </div>
                  <p style={{ 
                    fontSize: "12px", 
                    textTransform: "uppercase", 
                    letterSpacing: "1px",
                    color: "#666666",
                    marginTop: "4px",
                  }}>
                    {stat.label}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Win Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            style={{
              marginTop: "16px",
              border: "2px solid #000000",
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#f9f9f9",
            }}
          >
            <span style={{ 
              fontSize: "14px", 
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}>
              Win Rate
            </span>
            <span style={{ 
              fontSize: "28px", 
              fontWeight: 800,
            }}>
              {shouldShowMockData ? winRate : "0"}%
            </span>
          </motion.div>
        </motion.section>

        {/* Active Pools */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ marginBottom: "48px" }}
        >
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            marginBottom: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Clock size={24} />
              <h2 style={{ 
                fontSize: "24px", 
                fontWeight: 800, 
                textTransform: "uppercase", 
                letterSpacing: "1px",
              }}>
                Active Pools
              </h2>
              {activeParticipations.length > 0 && (
                <span style={{
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  padding: "4px 12px",
                  fontSize: "12px",
                  fontWeight: 700,
                }}>
                  {activeParticipations.length}
                </span>
              )}
            </div>
            {activeParticipations.length > 0 && (
              <Link href="/pools">
                <Button variant="outline" size="sm">
                  Browse More
                </Button>
              </Link>
            )}
          </div>

          {activeParticipations.length === 0 ? (
            <div style={{
              border: "2px solid #e5e5e5",
              padding: "64px 32px",
              textAlign: "center",
              backgroundColor: "#fafafa",
            }}>
              <TrendingUp size={48} color="#cccccc" style={{ margin: "0 auto 16px" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
                No Active Pools Yet
              </h3>
              <p style={{ fontSize: "14px", color: "#666666", marginBottom: "24px" }}>
                You haven&apos;t joined any pools yet. Start participating to earn rewards!
              </p>
              <Link href="/pools">
                <Button>
                  Explore Pools
                  <ArrowRight size={16} style={{ marginLeft: "8px" }} />
                </Button>
              </Link>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "24px",
            }}>
              {activeParticipations.map((participation) => (
                <PoolCard key={participation.id} pool={participation.pool} />
              ))}
            </div>
          )}
        </motion.section>

        {/* Won Pools */}
        {wonParticipations.length > 0 ? (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ marginBottom: "48px" }}
          >
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px",
              marginBottom: "24px",
            }}>
              <Trophy size={24} />
              <h2 style={{ 
                fontSize: "24px", 
                fontWeight: 800, 
                textTransform: "uppercase", 
                letterSpacing: "1px",
              }}>
                Won Pools
              </h2>
              <span style={{
                backgroundColor: "#eab308",
                color: "#000000",
                padding: "4px 12px",
                fontSize: "12px",
                fontWeight: 700,
              }}>
                {wonParticipations.length}
              </span>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "16px",
            }}>
              {wonParticipations.map((participation) => (
                <motion.div
                  key={participation.id}
                  whileHover={{ scale: 1.02, y: -4 }}
                  style={{
                    border: "3px solid #eab308",
                    padding: "24px",
                    backgroundColor: "#fefce8",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px",
                    marginBottom: "16px",
                  }}>
                    <span style={{ fontSize: "24px" }}>🏆</span>
                    <h3 style={{ fontSize: "18px", fontWeight: 700 }}>
                      {participation.pool.event.name}
                    </h3>
                  </div>
                  <p style={{ 
                    fontSize: "14px", 
                    color: "#666666",
                    marginBottom: "20px",
                  }}>
                    Congratulations! You won this pool.
                  </p>
                  <Link href={`/claim/${participation.poolId}`}>
                    <Button style={{ width: "100%" }}>
                      <CheckCircle size={16} style={{ marginRight: "8px" }} />
                      {participation.status === "WON" ? "Claim Ticket" : "View Ticket"}
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        ) : (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ marginBottom: "48px" }}
          >
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px",
              marginBottom: "24px",
            }}>
              <Trophy size={24} />
              <h2 style={{ 
                fontSize: "24px", 
                fontWeight: 800, 
                textTransform: "uppercase", 
                letterSpacing: "1px",
              }}>
                Won Pools
              </h2>
              <span style={{
                backgroundColor: "#eab308",
                color: "#000000",
                padding: "4px 12px",
                fontSize: "12px",
                fontWeight: 700,
              }}>
                0
              </span>
            </div>

            <div style={{
              padding: "60px 24px",
              textAlign: "center",
              backgroundColor: "#fafafa",
              border: "2px dashed #e5e5e5",
            }}>
              <Trophy size={48} color="#cccccc" style={{ margin: "0 auto 16px" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
                No Wins Yet
              </h3>
              <p style={{ fontSize: "14px", color: "#666666" }}>
                Join pools to increase your chances of winning!
              </p>
            </div>
          </motion.section>
        )}

        {/* Pending Payments */}
        {pendingPayments.length > 0 ? (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            style={{ marginBottom: "48px" }}
          >
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px",
              marginBottom: "24px",
            }}>
              <AlertCircle size={24} />
              <h2 style={{ 
                fontSize: "24px", 
                fontWeight: 800, 
                textTransform: "uppercase", 
                letterSpacing: "1px",
              }}>
                Pending Payments
              </h2>
              <span style={{
                backgroundColor: "#f97316",
                color: "#ffffff",
                padding: "4px 12px",
                fontSize: "12px",
                fontWeight: 700,
              }}>
                {pendingPayments.length}
              </span>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "16px",
            }}>
              {pendingPayments.map((participation) => (
                <motion.div
                  key={participation.id}
                  whileHover={{ scale: 1.02, y: -4 }}
                  style={{
                    border: "3px solid #f97316",
                    padding: "24px",
                    backgroundColor: "#fff7ed",
                    transition: "all 0.2s ease",
                  }}
                >
                  <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
                    {participation.pool.event.name}
                  </h3>
                  <p style={{ 
                    fontSize: "14px", 
                    color: "#666666",
                    marginBottom: "20px",
                  }}>
                    Complete your payment to secure your ticket
                  </p>
                  <Link href={`/pools/${participation.poolId}`}>
                    <Button variant="outline" style={{ width: "100%" }}>
                      Complete Payment
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        ) : (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            style={{ marginBottom: "48px" }}
          >
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px",
              marginBottom: "24px",
            }}>
              <AlertCircle size={24} />
              <h2 style={{ 
                fontSize: "24px", 
                fontWeight: 800, 
                textTransform: "uppercase", 
                letterSpacing: "1px",
              }}>
                Pending Payments
              </h2>
              <span style={{
                backgroundColor: "#f97316",
                color: "#ffffff",
                padding: "4px 12px",
                fontSize: "12px",
                fontWeight: 700,
              }}>
                0
              </span>
            </div>

            <div style={{
              padding: "60px 24px",
              textAlign: "center",
              backgroundColor: "#fafafa",
              border: "2px dashed #e5e5e5",
            }}>
              <CheckCircle size={48} color="#cccccc" style={{ margin: "0 auto 16px" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
                All Caught Up
              </h3>
              <p style={{ fontSize: "14px", color: "#666666" }}>
                No pending payments at the moment.
              </p>
            </div>
          </motion.section>
        )}

        {/* Past Participations */}
        {lostParticipations.length > 0 ? (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <details style={{ cursor: "pointer" }}>
              <summary style={{ 
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
                listStyle: "none",
              }}>
                <ChevronDown size={24} />
                <h2 style={{ 
                  fontSize: "24px", 
                  fontWeight: 800, 
                  textTransform: "uppercase", 
                  letterSpacing: "1px",
                }}>
                  Past Participations
                </h2>
                <span style={{
                  backgroundColor: "#e5e5e5",
                  color: "#666666",
                  padding: "4px 12px",
                  fontSize: "12px",
                  fontWeight: 700,
                }}>
                  {lostParticipations.length}
                </span>
              </summary>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "16px",
                marginTop: "16px",
              }}>
                {lostParticipations.map((participation) => (
                  <div
                    key={participation.id}
                    style={{
                      border: "2px solid #e5e5e5",
                      padding: "20px",
                      backgroundColor: "#fafafa",
                      opacity: 0.8,
                    }}
                  >
                    <h3 style={{ 
                      fontSize: "16px", 
                      fontWeight: 700, 
                      marginBottom: "8px",
                    }}>
                      {participation.pool.event.name}
                    </h3>
                    <p style={{ 
                      fontSize: "14px", 
                      color: "#666666",
                      marginBottom: "4px",
                    }}>
                      You earned {participation.tokenRewards} TLOOT tokens
                    </p>
                    <p style={{ fontSize: "12px", color: "#999999" }}>
                      Better luck next time!
                    </p>
                  </div>
                ))}
              </div>
            </details>
          </motion.section>
        ) : (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div style={{ 
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "24px",
            }}>
              <h2 style={{ 
                fontSize: "24px", 
                fontWeight: 800, 
                textTransform: "uppercase", 
                letterSpacing: "1px",
              }}>
                Past Participations
              </h2>
              <span style={{
                backgroundColor: "#e5e5e5",
                color: "#666666",
                padding: "4px 12px",
                fontSize: "12px",
                fontWeight: 700,
              }}>
                0
              </span>
            </div>

            <div style={{
              padding: "60px 24px",
              textAlign: "center",
              backgroundColor: "#fafafa",
              border: "2px dashed #e5e5e5",
            }}>
              <Clock size={48} color="#cccccc" style={{ margin: "0 auto 16px" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
                No Past Activity
              </h3>
              <p style={{ fontSize: "14px", color: "#666666" }}>
                Your completed pools will appear here.
              </p>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
