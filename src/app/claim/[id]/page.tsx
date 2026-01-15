"use client";

import React, { useState } from "react";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { WinAnimation } from "@/components/gamefi/win-animation";
import { motion } from "framer-motion";
import { 
  Calendar, 
  MapPin, 
  Ticket, 
  Coins, 
  CheckCircle, 
  Trophy,
  ArrowLeft,
  Sparkles,
  Clock,
  Download,
  Mail
} from "lucide-react";
import { getMockPoolById } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { CLAIM_FEE_PERCENTAGE } from "@/lib/constants";
import { toast } from "sonner";

export default function ClaimTicketPage() {
  const params = useParams();
  const poolId = params.id as string;
  const pool = getMockPoolById(poolId);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  const containerStyle: React.CSSProperties = {
    maxWidth: "1024px",
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

  if (!pool) {
    notFound();
  }

  // Mock: Check if user is a winner
  const isWinner = pool.winners?.includes("0x742d35Cc6074C4532895c05b22629ce5b3c28da4");
  const claimFee = (pool.event.ticketPrice * CLAIM_FEE_PERCENTAGE) / 100;
  const tokenReward = 100;
  const claimDeadline = new Date(pool.event.date.getTime() - 7 * 24 * 60 * 60 * 1000);
  const savings = pool.event.ticketPrice - claimFee;

  const handleClaimTicket = () => {
    setShowWinAnimation(true);
    setTimeout(() => {
      setShowWinAnimation(false);
      setHasClaimed(true);
      toast.success("Ticket claimed successfully!");
    }, 3000);
  };

  if (!isWinner) {
    return (
      <div style={{ backgroundColor: "#ffffff", color: "#000000", minHeight: "100vh" }}>
        <div style={containerStyle}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              maxWidth: "600px",
              margin: "80px auto",
              textAlign: "center",
            }}
          >
            <div style={{
              width: "96px",
              height: "96px",
              backgroundColor: "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 32px",
            }}>
              <Ticket size={48} color="#999999" />
            </div>
            <h2 style={{ 
              fontSize: "32px", 
              fontWeight: 800, 
              marginBottom: "16px",
              textTransform: "uppercase",
            }}>
              No Ticket to Claim
            </h2>
            <p style={{ 
              fontSize: "16px", 
              color: "#666666",
              marginBottom: "32px",
              lineHeight: 1.6,
            }}>
              You don&apos;t have a winning ticket for this pool. Keep participating to win!
            </p>
            <Button onClick={() => window.history.back()} variant="outline">
              <ArrowLeft size={16} style={{ marginRight: "8px" }} />
              Go Back
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showWinAnimation && (
        <WinAnimation
          tokenReward={tokenReward}
          onComplete={() => setShowWinAnimation(false)}
        />
      )}

      <div style={{ backgroundColor: "#ffffff", color: "#000000" }}>
        <div style={containerStyle}>
          {/* Congratulations Banner */}
          {!hasClaimed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{
                border: "3px solid #000000",
                backgroundColor: "#000000",
                color: "#ffffff",
                padding: "48px",
                marginBottom: "48px",
                textAlign: "center",
              }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 10, 0],
                  scale: [1, 1.1, 1.1, 1.1, 1.1, 1]
                }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{ fontSize: "64px", marginBottom: "24px" }}
              >
                🎉
              </motion.div>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#ffffff",
                color: "#000000",
                padding: "8px 16px",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "2px",
                marginBottom: "16px",
              }}>
                <Trophy size={14} />
                Winner
              </div>
              <h1 style={{ 
                fontSize: "clamp(32px, 5vw, 48px)", 
                fontWeight: 800, 
                marginBottom: "12px",
                textTransform: "uppercase",
              }}>
                Congratulations!
              </h1>
              <p style={{ fontSize: "18px", opacity: 0.8 }}>
                You&apos;ve won a ticket to {pool.event.name}
              </p>
            </motion.div>
          )}

          {/* Claimed Success Banner */}
          {hasClaimed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                border: "3px solid #22c55e",
                backgroundColor: "#dcfce7",
                padding: "48px",
                marginBottom: "48px",
                textAlign: "center",
              }}
            >
              <CheckCircle size={64} color="#22c55e" style={{ margin: "0 auto 24px" }} />
              <h1 style={{ 
                fontSize: "36px", 
                fontWeight: 800, 
                marginBottom: "12px",
                textTransform: "uppercase",
                color: "#166534",
              }}>
                Ticket Claimed!
              </h1>
              <p style={{ fontSize: "16px", color: "#166534" }}>
                Your ticket has been secured. Check your email for details.
              </p>
            </motion.div>
          )}

          {/* Main Content Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "32px",
          }}>
            {/* Left Column - Event Details */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Event Card */}
              <div style={{
                border: "2px solid #000000",
                overflow: "hidden",
                marginBottom: "24px",
              }}>
                <div style={{ 
                  position: "relative", 
                  height: "200px",
                  backgroundColor: "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "48px",
                  fontWeight: 800,
                }}>
                  {pool.event.category}
                </div>
                <div style={{ padding: "24px" }}>
                  <div style={{
                    display: "inline-block",
                    backgroundColor: "#f5f5f5",
                    padding: "4px 12px",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "12px",
                  }}>
                    {pool.event.category}
                  </div>
                  <h2 style={{ 
                    fontSize: "24px", 
                    fontWeight: 800,
                    marginBottom: "20px",
                  }}>
                    {pool.event.name}
                  </h2>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: "#000000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <Calendar size={20} color="#ffffff" />
                      </div>
                      <div>
                        <p style={{ fontSize: "12px", color: "#666666", marginBottom: "2px" }}>Date</p>
                        <p style={{ fontSize: "14px", fontWeight: 600 }}>
                          {format(pool.event.date, "MMMM dd, yyyy")}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: "#000000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <MapPin size={20} color="#ffffff" />
                      </div>
                      <div>
                        <p style={{ fontSize: "12px", color: "#666666", marginBottom: "2px" }}>Venue</p>
                        <p style={{ fontSize: "14px", fontWeight: 600 }}>
                          {pool.event.venue}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: "#000000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <Ticket size={20} color="#ffffff" />
                      </div>
                      <div>
                        <p style={{ fontSize: "12px", color: "#666666", marginBottom: "2px" }}>Original Price</p>
                        <p style={{ fontSize: "14px", fontWeight: 600 }}>
                          {formatCurrency(pool.event.ticketPrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Token Reward Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                style={{
                  border: "2px solid #000000",
                  padding: "24px",
                  backgroundColor: "#fafafa",
                }}
              >
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "12px",
                  marginBottom: "16px",
                }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#000000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Sparkles size={20} color="#ffffff" />
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700 }}>
                    Winner Bonus
                  </h3>
                </div>
                <div style={{ 
                  textAlign: "center",
                  padding: "24px 0",
                  borderTop: "1px solid #e5e5e5",
                }}>
                  <p style={{ 
                    fontSize: "48px", 
                    fontWeight: 800,
                    marginBottom: "8px",
                  }}>
                    +{tokenReward}
                  </p>
                  <p style={{ 
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#666666",
                  }}>
                    TLOOT Tokens
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Claim Action */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div style={{
                border: "3px solid #000000",
                padding: "32px",
              }}>
                <h2 style={{ 
                  fontSize: "24px", 
                  fontWeight: 800,
                  textTransform: "uppercase",
                  marginBottom: "24px",
                }}>
                  {hasClaimed ? "Ticket Information" : "Claim Your Ticket"}
                </h2>

                {!hasClaimed && (
                  <>
                    <p style={{ 
                      fontSize: "14px", 
                      color: "#666666",
                      lineHeight: 1.6,
                      marginBottom: "24px",
                    }}>
                      To claim your ticket, pay a {CLAIM_FEE_PERCENTAGE}% claim fee. 
                      This fee helps distribute rewards to all participants.
                    </p>

                    {/* Fee Breakdown */}
                    <div style={{
                      backgroundColor: "#f5f5f5",
                      padding: "20px",
                      marginBottom: "24px",
                    }}>
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between",
                        marginBottom: "12px",
                      }}>
                        <span style={{ color: "#666666" }}>Ticket Value</span>
                        <span style={{ fontWeight: 600 }}>
                          {formatCurrency(pool.event.ticketPrice)}
                        </span>
                      </div>
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between",
                        marginBottom: "12px",
                      }}>
                        <span style={{ color: "#666666" }}>
                          Claim Fee ({CLAIM_FEE_PERCENTAGE}%)
                        </span>
                        <span style={{ fontWeight: 600 }}>
                          {formatCurrency(claimFee)}
                        </span>
                      </div>
                      <div style={{
                        borderTop: "2px solid #000000",
                        paddingTop: "12px",
                        marginTop: "12px",
                        display: "flex",
                        justifyContent: "space-between",
                      }}>
                        <span style={{ fontWeight: 700 }}>Total to Pay</span>
                        <span style={{ 
                          fontSize: "24px", 
                          fontWeight: 800,
                        }}>
                          {formatCurrency(claimFee)}
                        </span>
                      </div>
                    </div>

                    {/* Savings Badge */}
                    <div style={{
                      backgroundColor: "#dcfce7",
                      border: "2px solid #22c55e",
                      padding: "16px",
                      marginBottom: "24px",
                      textAlign: "center",
                    }}>
                      <p style={{ 
                        fontSize: "14px", 
                        fontWeight: 700,
                        color: "#166534",
                      }}>
                        🎊 You&apos;re saving {formatCurrency(savings)} compared to the original price!
                      </p>
                    </div>

                    {/* Claim Deadline */}
                    <div style={{ marginBottom: "24px" }}>
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "8px",
                        marginBottom: "12px",
                      }}>
                        <Clock size={16} color="#666666" />
                        <p style={{ 
                          fontSize: "12px", 
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          color: "#666666",
                        }}>
                          Claim Deadline
                        </p>
                      </div>
                      <CountdownTimer deadline={claimDeadline} />
                    </div>

                    {/* Claim Button */}
                    <Button
                      style={{ width: "100%" }}
                      size="lg"
                      onClick={handleClaimTicket}
                    >
                      <Coins size={20} style={{ marginRight: "8px" }} />
                      Pay {formatCurrency(claimFee)} to Claim
                    </Button>
                  </>
                )}

                {hasClaimed && (
                  <>
                    {/* Success Message */}
                    <div style={{
                      backgroundColor: "#dcfce7",
                      border: "2px solid #22c55e",
                      padding: "16px",
                      marginBottom: "24px",
                    }}>
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "8px",
                        marginBottom: "8px",
                      }}>
                        <CheckCircle size={20} color="#22c55e" />
                        <p style={{ 
                          fontSize: "14px", 
                          fontWeight: 700,
                          color: "#166534",
                        }}>
                          Payment Confirmed
                        </p>
                      </div>
                      <p style={{ fontSize: "13px", color: "#166534" }}>
                        Your ticket has been secured and sent to your email.
                      </p>
                    </div>

                    {/* Ticket Details */}
                    <div style={{
                      backgroundColor: "#f5f5f5",
                      padding: "20px",
                      marginBottom: "24px",
                    }}>
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between",
                        marginBottom: "12px",
                      }}>
                        <span style={{ color: "#666666" }}>Ticket ID</span>
                        <span style={{ 
                          fontFamily: "monospace",
                          fontWeight: 600,
                          fontSize: "13px",
                        }}>
                          TKT-{pool.id}-{Date.now().toString().slice(-6)}
                        </span>
                      </div>
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between",
                        marginBottom: "12px",
                      }}>
                        <span style={{ color: "#666666" }}>You Paid</span>
                        <span style={{ fontWeight: 600 }}>
                          {formatCurrency(claimFee)}
                        </span>
                      </div>
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between",
                      }}>
                        <span style={{ color: "#666666" }}>You Saved</span>
                        <span style={{ 
                          fontWeight: 700,
                          color: "#22c55e",
                        }}>
                          {formatCurrency(savings)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: "12px" }}>
                      <Button
                        style={{ flex: 1 }}
                        variant="outline"
                        onClick={() => toast.info("Check your email for ticket details")}
                      >
                        <Mail size={16} style={{ marginRight: "8px" }} />
                        Email
                      </Button>
                      <Button
                        style={{ flex: 1 }}
                        onClick={() => toast.info("Download feature coming soon")}
                      >
                        <Download size={16} style={{ marginRight: "8px" }} />
                        Download
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* Additional Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                  marginTop: "24px",
                  padding: "20px",
                  backgroundColor: "#fafafa",
                  border: "1px solid #e5e5e5",
                }}
              >
                <h4 style={{ 
                  fontSize: "12px", 
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "12px",
                  color: "#666666",
                }}>
                  What Happens Next?
                </h4>
                <ul style={{ 
                  fontSize: "13px", 
                  color: "#666666",
                  lineHeight: 1.8,
                  paddingLeft: "16px",
                }}>
                  <li>You&apos;ll receive a confirmation email with your ticket</li>
                  <li>The claim fee is distributed to all pool participants</li>
                  <li>Your bonus tokens have been added to your balance</li>
                  <li>Present the ticket at the event venue for entry</li>
                </ul>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
