"use client";

import React, { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Users, Ticket, Coins, TrendingUp, AlertCircle, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PoolTypeBadge } from "@/components/pool/pool-type-badge";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { Badge } from "@/components/ui/badge";
import { usePoolStore } from "@/store/pool-store";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { PoolType, CLAIM_FEE_PERCENTAGE, CONTRACT_ADDRESSES } from "@/lib/constants";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { createWalletClient, createPublicClient, custom, http, parseUnits } from "viem";
import { mantleSepoliaTestnet } from "viem/chains";
import { SIMPLE_POOL_MANAGER_ABI, USDT_ABI } from "@/lib/abis";

export default function PoolDetailPage() {
  const params = useParams();
  const poolId = params?.id as string;
  const { pools, loadPools, getPoolById } = usePoolStore();
  const [isJoining, setIsJoining] = useState(false);
  
  // State for variable contribution in CommitToClaim pools
  const [contributionAmount, setContributionAmount] = useState<number>(0);
  
  useEffect(() => {
    if (pools.length === 0) {
      loadPools();
    }
  }, [pools.length, loadPools]);

  const pool = poolId ? getPoolById(poolId) : null;
  
  // Calculate values (safe to do before early return check)
  const progressPercentage = pool ? (pool.currentAmount / pool.targetAmount) * 100 : 0;
  const spotsLeft = pool ? pool.maxParticipants - pool.currentParticipants : 0;
  const isLuckyDraw = pool?.type === PoolType.LUCKY_DRAW;
  const isCommitToClaim = pool?.type === PoolType.COMMIT_TO_CLAIM;
  const odds = isLuckyDraw && pool && pool.currentParticipants > 0
    ? ((1 / pool.currentParticipants) * 100).toFixed(2)
    : "0";
  
  // Calculate remaining amount for Commit to Claim
  const remainingAmount = pool ? pool.targetAmount - pool.currentAmount : 0;
  const minContribution = 1; // 1 USDT minimum
  const maxContribution = isCommitToClaim ? (remainingAmount * 0.8) : pool?.entryAmount || 0;
  
  // Initialize contribution amount for CommitToClaim pools
  useEffect(() => {
    if (isCommitToClaim && remainingAmount > 0 && contributionAmount === 0) {
      setContributionAmount(Math.min(minContribution, maxContribution));
    }
  }, [isCommitToClaim, remainingAmount, contributionAmount, minContribution, maxContribution]);
  
  if (!pool) {
    if (pools.length === 0) {
      return <div style={{ padding: "48px", textAlign: "center" }}>Loading...</div>;
    }
    notFound();
  }

  const handleJoinPool = async () => {
    if (isJoining) return;
    
    try {
      setIsJoining(true);
      
      // Get wallet client
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        toast.error("Please connect your wallet first");
        return;
      }

      const walletClient = createWalletClient({
        chain: mantleSepoliaTestnet,
        transport: custom((window as any).ethereum),
      });

      const [account] = await walletClient.getAddresses();
      if (!account) {
        toast.error("No account connected");
        return;
      }

      const publicClient = createPublicClient({
        chain: mantleSepoliaTestnet,
        transport: http("https://rpc.sepolia.mantle.xyz"),
      });

      // For CommitToClaim: use variable contribution, for LuckyDraw: use fixed entryAmount
      const amountToContribute = isCommitToClaim ? contributionAmount : pool.entryAmount;
      
      // Convert entry amount to USDT units (6 decimals)
      const entryAmountInUSDT = parseUnits(amountToContribute.toString(), 6);

      // Check USDT balance
      const usdtBalance = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.USDT as `0x${string}`,
        abi: USDT_ABI,
        functionName: 'balanceOf',
        args: [account],
      }) as bigint;

      if (usdtBalance < entryAmountInUSDT) {
        toast.error(`Insufficient USDT balance. Need ${pool.entryAmount} USDT`);
        return;
      }

      // Check allowance
      const allowance = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.USDT as `0x${string}`,
        abi: USDT_ABI,
        functionName: 'allowance',
        args: [account, CONTRACT_ADDRESSES.POOL_MANAGER],
      }) as bigint;

      // Approve if needed
      if (allowance < entryAmountInUSDT) {
        toast.info("Approving USDT...");
        const approveHash = await walletClient.writeContract({
          address: CONTRACT_ADDRESSES.USDT as `0x${string}`,
          abi: USDT_ABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESSES.POOL_MANAGER, entryAmountInUSDT],
          account,
        });

        await publicClient.waitForTransactionReceipt({ hash: approveHash });
        toast.success("USDT approved!");
      }

      // Join pool
      toast.info("Joining pool...");
      const joinHash = await walletClient.writeContract({
        address: CONTRACT_ADDRESSES.POOL_MANAGER as `0x${string}`,
        abi: SIMPLE_POOL_MANAGER_ABI,
        functionName: 'joinPool',
        args: [BigInt(poolId), entryAmountInUSDT],
        account,
      });

      await publicClient.waitForTransactionReceipt({ hash: joinHash });
      
      toast.success("Successfully joined pool! You received TLOOT tokens.");
      
      // Reload pools to get updated data
      setIsJoining(true); // Keep button disabled while reloading
      await loadPools();
      
      // Small delay to ensure state updates
      setTimeout(() => setIsJoining(false), 500);
    } catch (error: any) {
      console.error('Error joining pool:', error);
      const errorMessage = error?.message || error?.toString() || "Unknown error";
      toast.error(`Failed to join pool: ${errorMessage}`);
    } finally {
      setIsJoining(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "48px 24px",
    backgroundColor: "#ffffff",
    color: "#000000",
  };

  const sectionStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  };

  const infoRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "#666666",
    textTransform: "uppercase",
    fontWeight: 600,
  };

  const valueStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: "14px",
  };

  const stepStyle: React.CSSProperties = {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  };

  const stepNumberStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
    backgroundColor: "#000000",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 700,
    flexShrink: 0,
  };

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <div style={containerStyle}>
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ marginBottom: "24px" }}
        >
          <Link
            href="/pools"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#666666",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} />
            Back to Pools
          </Link>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "32px" }}>
          {/* Main Content - Left Side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={sectionStyle}
          >
            {/* Event Banner */}
            <Card hover={false}>
              <div style={{ position: "relative", height: "320px", width: "100%" }}>
                <div style={{ backgroundColor: "#000", width: "100%", height: "100%" }} />
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.3), transparent)",
                }} />
                <div style={{ position: "absolute", top: "16px", right: "16px" }}>
                  <PoolTypeBadge type={pool.type} />
                </div>
                <div style={{ position: "absolute", bottom: "24px", left: "24px", right: "24px" }}>
                  <h1 style={{
                    fontSize: "32px",
                    fontWeight: 800,
                    color: "#ffffff",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}>
                    {pool.event.name}
                  </h1>
                  <Badge variant="secondary">{pool.event.category}</Badge>
                </div>
              </div>
            </Card>

            {/* Event Information */}
            <Card hover={false}>
              <div style={{ padding: "24px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px", textTransform: "uppercase" }}>
                  Event Details
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
                  <div style={infoRowStyle}>
                    <Calendar size={20} />
                    <div>
                      <p style={labelStyle}>Date</p>
                      <p style={valueStyle}>{format(pool.event.date, "MMMM dd, yyyy")}</p>
                    </div>
                  </div>
                  <div style={infoRowStyle}>
                    <MapPin size={20} />
                    <div>
                      <p style={labelStyle}>Venue</p>
                      <p style={valueStyle}>{pool.event.venue}</p>
                    </div>
                  </div>
                  <div style={infoRowStyle}>
                    <Ticket size={20} />
                    <div>
                      <p style={labelStyle}>Ticket Price</p>
                      <p style={valueStyle}>{formatCurrency(pool.event.ticketPrice)}</p>
                    </div>
                  </div>
                  <div style={infoRowStyle}>
                    <Coins size={20} />
                    <div>
                      <p style={labelStyle}>Entry Amount</p>
                      <p style={{ ...valueStyle, fontWeight: 700 }}>{formatCurrency(pool.entryAmount)}</p>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #e5e5e5" }}>
                  <p style={{ color: "#666666", lineHeight: 1.7 }}>{pool.event.description}</p>
                </div>
              </div>
            </Card>

            {/* How This Pool Works */}
            <Card hover={false}>
              <div style={{ padding: "24px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px", textTransform: "uppercase" }}>
                  How This Pool Works
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {isLuckyDraw ? (
                    <>
                      <div style={stepStyle}>
                        <span style={stepNumberStyle}>1</span>
                        <span>Contribute {formatCurrency(pool.entryAmount)} to join the pool</span>
                      </div>
                      <div style={stepStyle}>
                        <span style={stepNumberStyle}>2</span>
                        <span>Each contribution gives you one entry in the draw</span>
                      </div>
                      <div style={stepStyle}>
                        <span style={stepNumberStyle}>3</span>
                        <span>Winners are selected randomly when the pool completes</span>
                      </div>
                      <div style={stepStyle}>
                        <span style={stepNumberStyle}>4</span>
                        <span>Winners pay a {CLAIM_FEE_PERCENTAGE}% claim fee to get the ticket</span>
                      </div>
                      <div style={stepStyle}>
                        <span style={stepNumberStyle}>5</span>
                        <span>Non-winners receive platform tokens as consolation</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={stepStyle}>
                        <span style={stepNumberStyle}>1</span>
                        <span>Reserve your ticket with a {formatCurrency(pool.commitmentAmount || 0)} commitment</span>
                      </div>
                      <div style={stepStyle}>
                        <span style={stepNumberStyle}>2</span>
                        <span>Once the pool fills, tickets are reserved for all participants</span>
                      </div>
                      <div style={stepStyle}>
                        <span style={stepNumberStyle}>3</span>
                        <span>Complete the full payment before the deadline</span>
                      </div>
                      <div style={stepStyle}>
                        <span style={stepNumberStyle}>4</span>
                        <span>Receive your ticket upon successful payment</span>
                      </div>
                      <div style={stepStyle}>
                        <span style={stepNumberStyle}>5</span>
                        <span>Miss the deadline? Commitment is slashed and redistributed</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Sidebar - Right Side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={sectionStyle}
          >
            {/* Pool Stats */}
            <Card hover={false}>
              <div style={{ padding: "24px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px", textTransform: "uppercase" }}>
                  Pool Status
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* Progress */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={labelStyle}>Target Amount</span>
                      <span style={{ fontWeight: 700 }}>
                        {formatCurrency(pool.currentAmount)} / {formatCurrency(pool.targetAmount)}
                      </span>
                    </div>
                    <Progress value={progressPercentage} showLabel />
                  </div>

                  {/* Participants */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#666666" }}>
                      <Users size={16} />
                      <span style={{ fontSize: "14px" }}>Participants</span>
                    </div>
                    <span style={{ fontWeight: 700 }}>
                      {pool.currentParticipants} / {pool.maxParticipants}
                    </span>
                  </div>

                  {isLuckyDraw && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#666666" }}>
                        <TrendingUp size={16} />
                        <span style={{ fontSize: "14px" }}>Your Odds</span>
                      </div>
                      <span style={{ fontWeight: 700 }}>{odds}%</span>
                    </div>
                  )}

                  {/* Countdown */}
                  <div>
                    <p style={{ ...labelStyle, marginBottom: "8px" }}>Time Remaining</p>
                    <CountdownTimer deadline={pool.deadline} />
                  </div>

                  {/* Variable Contribution for Commit to Claim */}
                  {isCommitToClaim && remainingAmount > 0 && (
                    <div>
                      <p style={{ ...labelStyle, marginBottom: "8px" }}>Contribution Amount</p>
                      <div style={{ fontSize: "14px", color: "#666", marginBottom: "12px" }}>
                        Choose your contribution: ${minContribution.toFixed(2)} to ${maxContribution.toFixed(2)} (80% of remaining)
                      </div>
                      <input
                        type="range"
                        min={minContribution}
                        max={maxContribution}
                        step={0.01}
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(parseFloat(e.target.value))}
                        style={{ width: "100%", marginBottom: "12px" }}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <input
                          type="number"
                          min={minContribution}
                          max={maxContribution}
                          step={0.01}
                          value={contributionAmount}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val >= minContribution && val <= maxContribution) {
                              setContributionAmount(val);
                            }
                          }}
                          style={{ 
                            padding: "8px 12px", 
                            border: "1px solid #e5e5e5", 
                            borderRadius: "8px", 
                            fontSize: "16px",
                            fontWeight: 600,
                            width: "120px"
                          }}
                        />
                        <span style={{ fontSize: "14px", color: "#666" }}>
                          Remaining: {formatCurrency(remainingAmount)}
                        </span>
                      </div>
                    </div>
                  )}

                  {isCommitToClaim && remainingAmount <= 0 && (
                    <div style={{ fontSize: "14px", color: "#666", padding: "12px", backgroundColor: "#f8f8f8", borderRadius: "8px", border: "1px solid #e5e5e5" }}>
                      ✅ Pool fully funded!
                    </div>
                  )}

                  {/* Join Button */}
                  <Button
                    style={{ width: "100%" }}
                    size="lg"
                    onClick={handleJoinPool}
                    disabled={progressPercentage >= 100 || isJoining || (isCommitToClaim && remainingAmount <= 0)}
                  >
                    {isJoining 
                      ? "Joining..." 
                      : progressPercentage >= 100 
                        ? "Pool Filled" 
                        : `Join for ${formatCurrency(isCommitToClaim ? contributionAmount : pool.entryAmount)}`}
                  </Button>

                  {spotsLeft > 0 && spotsLeft <= 5 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ff6600", fontSize: "14px" }}>
                      <AlertCircle size={16} />
                      <span>Only {spotsLeft} spots left!</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Rewards Info */}
            <Card hover={false}>
              <div style={{ padding: "24px", backgroundColor: "#f8f8f8" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Coins size={20} />
                  Token Rewards
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", color: "#444444" }}>
                  <p>• Earn tokens for participating</p>
                  <p>• Bonus tokens from yield distribution</p>
                  <p>• Extra rewards from claim fees</p>
                  <p style={{ fontWeight: 700, color: "#000000", marginTop: "8px" }}>
                    All participants earn tokens regardless of outcome!
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
