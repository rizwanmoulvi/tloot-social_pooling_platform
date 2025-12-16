"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Users,
  Calendar,
  MapPin,
  Ticket,
  DollarSign,
  Clock,
  Trophy,
  Info,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PoolType } from "@/lib/constants";
import { useAccount } from "wagmi";
import { usePoolStore } from "@/store/pool-store";

type Step = 0 | 1 | 2 | 3;

interface EventDetails {
  name: string;
  description: string;
  venue: string;
  date: string;
  ticketPrice: string;
  category: string;
}

interface PoolSettings {
  type: PoolType;
  maxParticipants: string;
  entryAmount: string;
  winnerCount: string;
  daysUntilDeadline: string;
}

export default function CreatePoolPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { createPool, isCreating } = usePoolStore();
  const [step, setStep] = useState<Step>(0);
  const [selectedPoolType, setSelectedPoolType] = useState<PoolType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [eventDetails, setEventDetails] = useState<EventDetails>({
    name: "",
    description: "",
    venue: "",
    date: "",
    ticketPrice: "",
    category: "Music",
  });
  
  const [poolSettings, setPoolSettings] = useState<PoolSettings>({
    type: PoolType.LUCKY_DRAW,
    maxParticipants: "10",
    entryAmount: "",
    winnerCount: "1",
    daysUntilDeadline: "7",
  });

  const containerStyle: React.CSSProperties = {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "48px 24px",
    minHeight: "100vh",
    backgroundColor: "#ffffff",
    color: "#000000",
  };

  const cardStyle: React.CSSProperties = {
    border: "3px solid #000000",
    backgroundColor: "#ffffff",
    padding: "32px",
    marginBottom: "24px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    fontSize: "14px",
    border: "2px solid #000000",
    backgroundColor: "#ffffff",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "8px",
    color: "#000000",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: "pointer",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23000' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 16px center",
    paddingRight: "40px",
  };

  const stepIndicatorStyle = (stepNum: number): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    backgroundColor: step >= stepNum ? "#000000" : "#e5e5e5",
    color: step >= stepNum ? "#ffffff" : "#666666",
    fontWeight: 700,
    fontSize: "16px",
    transition: "all 0.3s ease",
  });

  const typeCardStyle = (isSelected: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "24px",
    border: isSelected ? "3px solid #000000" : "2px solid #e5e5e5",
    backgroundColor: isSelected ? "#f5f5f5" : "#ffffff",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "left" as const,
  });

  const handleCreatePool = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsSubmitting(true);

    try {
      const isCommitClaim = poolSettings.type === PoolType.COMMIT_TO_CLAIM;
      
      // Create pool using store
      await createPool({
        eventName: eventDetails.name,
        eventDescription: eventDetails.description,
        eventVenue: eventDetails.venue,
        eventDate: new Date(eventDetails.date),
        eventCategory: eventDetails.category,
        ticketPrice: parseFloat(eventDetails.ticketPrice),
        poolType: poolSettings.type,
        entryAmount: parseFloat(poolSettings.entryAmount),
        maxParticipants: isCommitClaim ? 1 : parseInt(poolSettings.maxParticipants),
        winnerCount: isCommitClaim ? 1 : parseInt(poolSettings.winnerCount),
        daysUntilDeadline: parseInt(poolSettings.daysUntilDeadline),
        creatorAddress: address,
      });

      toast.success(
        isCommitClaim 
          ? "Commit-to-Claim pool created! You are the ticket owner."
          : "Lucky Draw pool created successfully!"
      );
      
      router.push("/pools");
    } catch (error: any) {
      console.error('Pool creation error:', error);
      const errorMessage = error?.message || error?.toString() || "Unknown error";
      toast.error(`Failed to create pool: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep1 = () => {
    if (!eventDetails.name || !eventDetails.venue || !eventDetails.date || !eventDetails.ticketPrice) {
      toast.error("Please fill in all required event details");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!poolSettings.entryAmount || !poolSettings.maxParticipants) {
      toast.error("Please fill in all pool settings");
      return false;
    }
    const entry = parseFloat(poolSettings.entryAmount);
    const ticket = parseFloat(eventDetails.ticketPrice);
    if (entry >= ticket) {
      toast.error("Entry amount must be less than ticket price");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (step === 0 && selectedPoolType !== null) {
      setPoolSettings({ ...poolSettings, type: selectedPoolType });
      setStep(1);
    }
    else if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const prevStep = () => {
    if (step > 0) setStep((step - 1) as Step);
  };

  // Auto-calculate 20% upfront cost for commit-to-claim when ticket price changes
  const calculateUpfrontCost = (ticketPrice: string) => {
    if (selectedPoolType === PoolType.COMMIT_TO_CLAIM && ticketPrice) {
      const upfront = (parseFloat(ticketPrice) * 0.2).toFixed(2);
      setPoolSettings(prev => ({ ...prev, entryAmount: upfront }));
    }
  };

  // Auto-calculate max participants for Lucky Draw (ticket price / entry amount)
  const calculateMaxParticipants = (entryAmount: string) => {
    if (selectedPoolType === PoolType.LUCKY_DRAW && entryAmount && eventDetails.ticketPrice) {
      const entry = parseFloat(entryAmount);
      const ticket = parseFloat(eventDetails.ticketPrice);
      if (entry > 0 && ticket > 0) {
        const participants = Math.ceil(ticket / entry);
        setPoolSettings(prev => ({ ...prev, maxParticipants: participants.toString() }));
      }
    }
  };

  // Auto-calculate payment deadline for commit-to-claim (30 days before event)
  const calculatePaymentDeadline = (eventDate: string) => {
    if (selectedPoolType === PoolType.COMMIT_TO_CLAIM && eventDate) {
      const event = new Date(eventDate);
      // Payment deadline is 30 days before event
      const deadlineDate = new Date(event);
      deadlineDate.setDate(deadlineDate.getDate() - 30);
      
      // Calculate days from today to deadline
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffTime = deadlineDate.getTime() - today.getTime();
      const daysUntilDeadline = Math.max(7, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      
      setPoolSettings(prev => ({ ...prev, daysUntilDeadline: daysUntilDeadline.toString() }));
    }
  };

  // Get the calculated deadline date for display (event date - 30 days)
  const getDeadlineDate = () => {
    if (!eventDetails.date) return null;
    const event = new Date(eventDetails.date);
    const deadline = new Date(event);
    deadline.setDate(deadline.getDate() - 30);
    return deadline;
  };

  return (
    <div style={{ backgroundColor: "#ffffff" }}>
      <div style={containerStyle}>
        {/* Back Link */}
        <Link href="/pools" style={{ textDecoration: "none" }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#666666",
              fontSize: "14px",
              marginBottom: "32px",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={18} />
            Back to Pools
          </motion.div>
        </Link>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: "40px" }}
        >
          <h1 style={{
            fontSize: "36px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: "12px",
          }}>
            Create a Pool
          </h1>
          <p style={{ fontSize: "16px", color: "#666666" }}>
            Create a pool for an event you want tickets for. Others can join to share the cost.
          </p>
        </motion.div>

        {/* Step Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "40px",
          }}
        >
          <div style={stepIndicatorStyle(0)}>1</div>
          <div style={{ width: "40px", height: "3px", backgroundColor: step >= 1 ? "#000000" : "#e5e5e5" }} />
          <div style={stepIndicatorStyle(1)}>2</div>
          <div style={{ width: "40px", height: "3px", backgroundColor: step >= 2 ? "#000000" : "#e5e5e5" }} />
          <div style={stepIndicatorStyle(2)}>3</div>
          <div style={{ width: "40px", height: "3px", backgroundColor: step >= 3 ? "#000000" : "#e5e5e5" }} />
          <div style={stepIndicatorStyle(3)}>4</div>
        </motion.div>

        {/* Step 0: Pool Type Selection */}
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#000000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Trophy size={24} color="#ffffff" />
                </div>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Choose Pool Type</h2>
                  <p style={{ fontSize: "14px", color: "#666666" }}>Select how you want to get tickets</p>
                </div>
              </div>

              {/* Pool Type Cards */}
              <div style={{ display: "flex", gap: "20px" }}>
                {/* Lucky Draw */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPoolType(PoolType.LUCKY_DRAW)}
                  style={{
                    flex: 1,
                    padding: "28px",
                    border: selectedPoolType === PoolType.LUCKY_DRAW ? "3px solid #000000" : "2px solid #e5e5e5",
                    backgroundColor: selectedPoolType === PoolType.LUCKY_DRAW ? "#f5f5f5" : "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{
                    width: "56px",
                    height: "56px",
                    backgroundColor: selectedPoolType === PoolType.LUCKY_DRAW ? "#000000" : "#f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}>
                    <Sparkles size={28} color={selectedPoolType === PoolType.LUCKY_DRAW ? "#ffffff" : "#666666"} />
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Lucky Draw</h3>
                  <p style={{ fontSize: "14px", color: "#666666", lineHeight: 1.6, marginBottom: "16px" }}>
                    Pool funds with others. Random winners get tickets. Small entry fee, big potential!
                  </p>
                  <div style={{ 
                    backgroundColor: selectedPoolType === PoolType.LUCKY_DRAW ? "#000000" : "#f5f5f5", 
                    color: selectedPoolType === PoolType.LUCKY_DRAW ? "#ffffff" : "#666666",
                    padding: "12px", 
                    fontSize: "13px"
                  }}>
                    ✓ Low entry cost<br/>
                    ✓ Multiple participants<br/>
                    ✓ Random winner selection<br/>
                    ✓ Token rewards for all
                  </div>
                </motion.div>

                {/* Commit to Claim */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPoolType(PoolType.COMMIT_TO_CLAIM)}
                  style={{
                    flex: 1,
                    padding: "28px",
                    border: selectedPoolType === PoolType.COMMIT_TO_CLAIM ? "3px solid #f59e0b" : "2px solid #e5e5e5",
                    backgroundColor: selectedPoolType === PoolType.COMMIT_TO_CLAIM ? "#fef3c7" : "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{
                    width: "56px",
                    height: "56px",
                    backgroundColor: selectedPoolType === PoolType.COMMIT_TO_CLAIM ? "#f59e0b" : "#f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}>
                    <Users size={28} color={selectedPoolType === PoolType.COMMIT_TO_CLAIM ? "#ffffff" : "#666666"} />
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Commit-to-Claim</h3>
                  <p style={{ fontSize: "14px", color: "#666666", lineHeight: 1.6, marginBottom: "16px" }}>
                    <strong>You own the ticket.</strong> Pay 20% upfront, complete payment before event.
                  </p>
                  <div style={{ 
                    backgroundColor: selectedPoolType === PoolType.COMMIT_TO_CLAIM ? "#f59e0b" : "#f5f5f5", 
                    color: selectedPoolType === PoolType.COMMIT_TO_CLAIM ? "#ffffff" : "#666666",
                    padding: "12px", 
                    fontSize: "13px"
                  }}>
                    ✓ Guaranteed ticket<br/>
                    ✓ Only 20% upfront<br/>
                    ✓ Platform handles purchase<br/>
                    ⚠ You must complete payment
                  </div>
                </motion.div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button 
                onClick={nextStep} 
                size="lg" 
                style={{ minWidth: "200px" }}
                disabled={selectedPoolType === null}
              >
                Continue to Event Details
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 1: Event Details */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#000000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Ticket size={24} color="#ffffff" />
                </div>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Event Details</h2>
                  <p style={{ fontSize: "14px", color: "#666666" }}>Tell us about the event</p>
                </div>
              </div>

              <div style={{ display: "grid", gap: "20px" }}>
                {/* Event Name */}
                <div>
                  <label style={labelStyle}>Event Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Taylor Swift - Eras Tour"
                    value={eventDetails.name}
                    onChange={(e) => setEventDetails({ ...eventDetails, name: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    placeholder="Brief description of the event..."
                    value={eventDetails.description}
                    onChange={(e) => setEventDetails({ ...eventDetails, description: e.target.value })}
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>

                {/* Venue & Date */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Venue *</label>
                    <div style={{ position: "relative" }}>
                      <MapPin size={18} color="#666666" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                      <input
                        type="text"
                        placeholder="e.g., Madison Square Garden"
                        value={eventDetails.venue}
                        onChange={(e) => setEventDetails({ ...eventDetails, venue: e.target.value })}
                        style={{ ...inputStyle, paddingLeft: "44px" }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Event Date *</label>
                    <div style={{ position: "relative" }}>
                      <Calendar size={18} color="#666666" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                      <input
                        type="date"
                        value={eventDetails.date}
                        onChange={(e) => {
                          setEventDetails({ ...eventDetails, date: e.target.value });
                          calculatePaymentDeadline(e.target.value);
                        }}
                        style={{ ...inputStyle, paddingLeft: "44px" }}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                </div>

                {/* Ticket Price & Category */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Ticket Price (USDT) *</label>
                    <div style={{ position: "relative" }}>
                      <DollarSign size={18} color="#666666" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                      <input
                        type="number"
                        placeholder="e.g., 150"
                        value={eventDetails.ticketPrice}
                        onChange={(e) => {
                          setEventDetails({ ...eventDetails, ticketPrice: e.target.value });
                          calculateUpfrontCost(e.target.value);
                        }}
                        style={{ ...inputStyle, paddingLeft: "44px" }}
                        min="1"
                      />
                    </div>
                    {selectedPoolType === PoolType.COMMIT_TO_CLAIM && eventDetails.ticketPrice && (
                      <p style={{ fontSize: "12px", color: "#f59e0b", marginTop: "6px", fontWeight: 600 }}>
                        Upfront cost (20%): ${(parseFloat(eventDetails.ticketPrice) * 0.2).toFixed(2)} USDT
                      </p>
                    )}
                  </div>
                  <div>
                    <label style={labelStyle}>Category</label>
                    <select
                      value={eventDetails.category}
                      onChange={(e) => setEventDetails({ ...eventDetails, category: e.target.value })}
                      style={selectStyle}
                    >
                      <option value="Music">Music</option>
                      <option value="Sports">Sports</option>
                      <option value="Festival">Festival</option>
                      <option value="Theater">Theater</option>
                      <option value="Comedy">Comedy</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={nextStep} size="lg" style={{ minWidth: "200px" }}>
                Continue to Pool Settings
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Pool Settings */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#000000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Trophy size={24} color="#ffffff" />
                </div>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Pool Type</h2>
                  <p style={{ fontSize: "14px", color: "#666666" }}>Choose how participants will get tickets</p>
                </div>
              </div>

              {/* Pool Type Selection */}
              <div style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
                {/* Lucky Draw */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setPoolSettings({ ...poolSettings, type: PoolType.LUCKY_DRAW })}
                  style={typeCardStyle(poolSettings.type === PoolType.LUCKY_DRAW)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: poolSettings.type === PoolType.LUCKY_DRAW ? "#000000" : "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <Sparkles size={20} color={poolSettings.type === PoolType.LUCKY_DRAW ? "#ffffff" : "#666666"} />
                    </div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Lucky Draw</h3>
                  </div>
                  <p style={{ fontSize: "13px", color: "#666666", lineHeight: 1.5 }}>
                    Multiple participants pool funds together. Winners are randomly selected and pay 20% claim fee to get tickets.
                  </p>
                  <div style={{ marginTop: "12px", padding: "8px 12px", backgroundColor: "#f5f5f5", fontSize: "12px", color: "#666666" }}>
                    ✓ Low entry cost • ✓ Chance to win • ✓ Token rewards
                  </div>
                </motion.div>

                {/* Commit to Claim */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setPoolSettings({ ...poolSettings, type: PoolType.COMMIT_TO_CLAIM, winnerCount: "1" })}
                  style={typeCardStyle(poolSettings.type === PoolType.COMMIT_TO_CLAIM)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: poolSettings.type === PoolType.COMMIT_TO_CLAIM ? "#000000" : "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <Users size={20} color={poolSettings.type === PoolType.COMMIT_TO_CLAIM ? "#ffffff" : "#666666"} />
                    </div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Commit-to-Claim</h3>
                  </div>
                  <p style={{ fontSize: "13px", color: "#666666", lineHeight: 1.5 }}>
                    <strong>You own the ticket.</strong> Commit a deposit now, complete payment before deadline. Platform handles purchase.
                  </p>
                  <div style={{ marginTop: "12px", padding: "8px 12px", backgroundColor: "#fef3c7", fontSize: "12px", color: "#92400e" }}>
                    ⚠ You are responsible for the ticket payment
                  </div>
                </motion.div>
              </div>

              {/* Pool Configuration */}
              <div style={{ display: "grid", gap: "20px" }}>
                {poolSettings.type === PoolType.LUCKY_DRAW ? (
                  <>
                    {/* Lucky Draw Settings */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label style={labelStyle}>Entry Amount (USDT) *</label>
                        <div style={{ position: "relative" }}>
                          <DollarSign size={18} color="#666666" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                          <input
                            type="number"
                            placeholder="e.g., 15"
                            value={poolSettings.entryAmount}
                            onChange={(e) => {
                              setPoolSettings({ ...poolSettings, entryAmount: e.target.value });
                              calculateMaxParticipants(e.target.value);
                            }}
                            style={{ ...inputStyle, paddingLeft: "44px" }}
                            min="1"
                          />
                        </div>
                        <p style={{ fontSize: "12px", color: "#666666", marginTop: "6px" }}>
                          Amount each participant pays to enter
                        </p>
                      </div>
                      <div>
                        <label style={labelStyle}>Participants Needed</label>
                        <div style={{ position: "relative" }}>
                          <Users size={18} color="#666666" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                          <input
                            type="text"
                            value={poolSettings.maxParticipants ? `${poolSettings.maxParticipants} participants` : "Enter entry amount"}
                            readOnly
                            style={{ ...inputStyle, paddingLeft: "44px", backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                          />
                        </div>
                        <p style={{ fontSize: "12px", color: "#666666", marginTop: "6px" }}>
                          Auto-calculated: Ticket price ÷ Entry amount
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label style={labelStyle}>Number of Winners</label>
                        <div style={{ position: "relative" }}>
                          <Trophy size={18} color="#666666" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                          <input
                            type="text"
                            value="1 winner (1 ticket)"
                            readOnly
                            style={{ ...inputStyle, paddingLeft: "44px", backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                          />
                        </div>
                        <p style={{ fontSize: "12px", color: "#666666", marginTop: "6px" }}>
                          Multiple tickets coming soon
                        </p>
                      </div>
                      <div>
                        <label style={labelStyle}>Pool Duration (Days) *</label>
                        <div style={{ position: "relative" }}>
                          <Clock size={18} color="#666666" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                          <input
                            type="number"
                            placeholder="e.g., 7"
                            value={poolSettings.daysUntilDeadline}
                            onChange={(e) => setPoolSettings({ ...poolSettings, daysUntilDeadline: e.target.value })}
                            style={{ ...inputStyle, paddingLeft: "44px" }}
                            min="1"
                            max="30"
                          />
                        </div>
                        <p style={{ fontSize: "12px", color: "#666666", marginTop: "6px" }}>
                          Makesure it ends before public sale of tickets of the event
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Commit-to-Claim Settings */}
                    <div style={{
                      backgroundColor: "#fef3c7",
                      border: "2px solid #f59e0b",
                      padding: "16px",
                      marginBottom: "8px",
                    }}>
                      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <Info size={20} color="#92400e" style={{ flexShrink: 0, marginTop: "2px" }} />
                        <div>
                          <p style={{ fontSize: "14px", fontWeight: 600, color: "#92400e", marginBottom: "4px" }}>
                            You Are The Ticket Owner
                          </p>
                          <p style={{ fontSize: "13px", color: "#92400e", lineHeight: 1.5 }}>
                            As the creator of a Commit-to-Claim pool, you are responsible for completing the full ticket payment before the deadline. The platform will purchase and deliver the ticket to you.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label style={labelStyle}>Upfront Cost (20% of Ticket)</label>
                        <div style={{ position: "relative" }}>
                          <DollarSign size={18} color="#666666" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                          <input
                            type="text"
                            value={`$${poolSettings.entryAmount} USDT`}
                            readOnly
                            style={{ ...inputStyle, paddingLeft: "44px", backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                          />
                        </div>
                        <p style={{ fontSize: "12px", color: "#f59e0b", marginTop: "6px", fontWeight: 600 }}>
                          Fixed at 20% of ticket price (non-refundable if you don't pay)
                        </p>
                      </div>
                      <div>
                        <label style={labelStyle}>Payment Deadline</label>
                        <div style={{ position: "relative" }}>
                          <Clock size={18} color="#666666" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                          <input
                            type="text"
                            value={getDeadlineDate() 
                              ? `${getDeadlineDate()?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} (${poolSettings.daysUntilDeadline} days)`
                              : "Select event date first"
                            }
                            readOnly
                            style={{ ...inputStyle, paddingLeft: "44px", backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                          />
                        </div>
                        <p style={{ fontSize: "12px", color: "#666666", marginTop: "6px" }}>
                          Auto-calculated: 30 days before event
                        </p>
                      </div>
                    </div>

                    {/* Payment Breakdown */}
                    {eventDetails.ticketPrice && (
                      <div style={{
                        backgroundColor: "#f5f5f5",
                        border: "2px solid #000000",
                        padding: "20px",
                      }}>
                        <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px", textTransform: "uppercase" }}>
                          Payment Breakdown
                        </h4>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                          <span style={{ color: "#666666" }}>Upfront (20% - pay now)</span>
                          <span style={{ fontWeight: 600 }}>${(parseFloat(eventDetails.ticketPrice) * 0.2).toFixed(2)} USDT</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                          <span style={{ color: "#666666" }}>Remaining (80% - before deadline)</span>
                          <span style={{ fontWeight: 600 }}>
                            ${(parseFloat(eventDetails.ticketPrice) * 0.8).toFixed(2)} USDT
                          </span>
                        </div>
                        <div style={{ borderTop: "2px solid #000000", paddingTop: "12px", display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontWeight: 700 }}>Total Ticket Price</span>
                          <span style={{ fontWeight: 700 }}>${eventDetails.ticketPrice} USDT</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button variant="outline" onClick={prevStep} size="lg">
                Back
              </Button>
              <Button onClick={nextStep} size="lg" style={{ minWidth: "200px" }}>
                Review Pool
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review & Create */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#000000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <CheckCircle2 size={24} color="#ffffff" />
                </div>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Review Your Pool</h2>
                  <p style={{ fontSize: "14px", color: "#666666" }}>Confirm details before creating</p>
                </div>
              </div>

              {/* Event Summary */}
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", color: "#666666" }}>
                  Event Details
                </h3>
                <div style={{ backgroundColor: "#f5f5f5", padding: "20px", border: "2px solid #e5e5e5" }}>
                  <h4 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>{eventDetails.name}</h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "14px", color: "#666666" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <MapPin size={16} />
                      {eventDetails.venue}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Calendar size={16} />
                      {new Date(eventDetails.date).toLocaleDateString("en-US", { dateStyle: "long" })}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Ticket size={16} />
                      ${eventDetails.ticketPrice} USDT
                    </div>
                  </div>
                </div>
              </div>

              {/* Pool Summary */}
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", color: "#666666" }}>
                  Pool Configuration
                </h3>
                <div style={{ 
                  backgroundColor: poolSettings.type === PoolType.COMMIT_TO_CLAIM ? "#fef3c7" : "#f5f5f5", 
                  padding: "20px", 
                  border: poolSettings.type === PoolType.COMMIT_TO_CLAIM ? "2px solid #f59e0b" : "2px solid #e5e5e5"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    {poolSettings.type === PoolType.LUCKY_DRAW ? (
                      <Sparkles size={20} color="#000000" />
                    ) : (
                      <Users size={20} color="#92400e" />
                    )}
                    <span style={{ fontSize: "16px", fontWeight: 700, color: poolSettings.type === PoolType.COMMIT_TO_CLAIM ? "#92400e" : "#000000" }}>
                      {poolSettings.type === PoolType.LUCKY_DRAW ? "Lucky Draw Pool" : "Commit-to-Claim Pool"}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "14px" }}>
                    <div>
                      <span style={{ color: "#666666" }}>
                        {poolSettings.type === PoolType.LUCKY_DRAW ? "Entry Amount:" : "Commitment:"}
                      </span>
                      <span style={{ fontWeight: 600, marginLeft: "8px" }}>${poolSettings.entryAmount} USDT</span>
                    </div>
                    {poolSettings.type === PoolType.LUCKY_DRAW && (
                      <>
                        <div>
                          <span style={{ color: "#666666" }}>Max Participants:</span>
                          <span style={{ fontWeight: 600, marginLeft: "8px" }}>{poolSettings.maxParticipants}</span>
                        </div>
                        <div>
                          <span style={{ color: "#666666" }}>Winners:</span>
                          <span style={{ fontWeight: 600, marginLeft: "8px" }}>{poolSettings.winnerCount}</span>
                        </div>
                      </>
                    )}
                    <div>
                      <span style={{ color: "#666666" }}>Duration:</span>
                      <span style={{ fontWeight: 600, marginLeft: "8px" }}>{poolSettings.daysUntilDeadline} days</span>
                    </div>
                  </div>

                  {poolSettings.type === PoolType.COMMIT_TO_CLAIM && (
                    <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "rgba(0,0,0,0.05)", fontSize: "13px", color: "#92400e" }}>
                      <strong>⚠ Reminder:</strong> You must complete the remaining payment of{" "}
                      <strong>${(parseFloat(eventDetails.ticketPrice) - parseFloat(poolSettings.entryAmount)).toFixed(2)} USDT</strong>{" "}
                      within {poolSettings.daysUntilDeadline} days or forfeit your commitment.
                    </div>
                  )}
                </div>
              </div>

              {/* Wallet Info */}
              <div style={{
                backgroundColor: "#f5f5f5",
                padding: "16px 20px",
                border: "2px solid #e5e5e5",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <div>
                  <span style={{ fontSize: "12px", color: "#666666", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Pool Creator
                  </span>
                  <p style={{ fontSize: "14px", fontWeight: 600, fontFamily: "monospace" }}>
                    {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Wallet not connected"}
                  </p>
                </div>
                {!isConnected && (
                  <span style={{ fontSize: "12px", color: "#dc2626" }}>Please connect wallet to continue</span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button variant="outline" onClick={prevStep} size="lg">
                Back
              </Button>
              <Button 
                onClick={handleCreatePool} 
                size="lg" 
                style={{ minWidth: "200px" }}
                disabled={!isConnected || isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Pool"}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
