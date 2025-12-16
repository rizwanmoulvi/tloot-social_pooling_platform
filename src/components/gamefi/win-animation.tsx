"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Trophy, Sparkles, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dynamically import Confetti to avoid SSR issues
const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

interface WinAnimationProps {
  tokenReward: number;
  onComplete?: () => void;
}

export function WinAnimation({ tokenReward, onComplete }: WinAnimationProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Set window size on mount
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
      if (onComplete) {
        onComplete();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.9)",
      backdropFilter: "blur(8px)",
    }}>
      {showConfetti && windowSize.width > 0 && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
      >
        <div style={{
          width: "100%",
          maxWidth: "400px",
          border: "3px solid #eab308",
          backgroundColor: "#ffffff",
          padding: "48px 32px",
          textAlign: "center",
        }}>
          {/* Trophy Icon */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}
          >
            <div style={{
              width: "96px",
              height: "96px",
              backgroundColor: "#fef3c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Trophy size={48} color="#eab308" />
            </div>
          </motion.div>

          {/* Congratulations Text */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ marginBottom: "24px" }}
          >
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "8px",
              marginBottom: "8px",
            }}>
              <Sparkles size={24} color="#eab308" />
              <h2 style={{ 
                fontSize: "28px", 
                fontWeight: 800,
                color: "#000000",
                textTransform: "uppercase",
              }}>
                Congratulations!
              </h2>
              <Sparkles size={24} color="#eab308" />
            </div>
            <p style={{ fontSize: "16px", color: "#666666" }}>You won the pool!</p>
          </motion.div>

          {/* Token Reward */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: "spring" }}
            style={{
              backgroundColor: "#f5f5f5",
              border: "2px solid #000000",
              padding: "20px",
              marginBottom: "24px",
            }}
          >
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "8px",
              marginBottom: "8px",
            }}>
              <Coins size={20} color="#666666" />
              <span style={{ fontSize: "12px", color: "#666666", textTransform: "uppercase", letterSpacing: "1px" }}>
                Token Reward
              </span>
            </div>
            <p style={{ fontSize: "36px", fontWeight: 800, color: "#000000" }}>
              +{tokenReward} TLOOT
            </p>
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <Button
              size="lg"
              style={{ width: "100%" }}
              onClick={() => {
                setShowConfetti(false);
                if (onComplete) onComplete();
              }}
            >
              Claim Your Ticket
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
