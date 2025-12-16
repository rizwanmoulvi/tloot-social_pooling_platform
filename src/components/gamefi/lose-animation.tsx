"use client";

import React from "react";
import { motion } from "framer-motion";
import { Coins, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LoseAnimationProps {
  tokenReward: number;
  onComplete?: () => void;
}

export function LoseAnimation({ tokenReward, onComplete }: LoseAnimationProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
      >
        <Card className="w-full max-w-md border-2 border-zinc-700">
          <CardContent className="p-8 text-center space-y-6">
            {/* Icon */}
            <motion.div
              initial={{ rotate: -45, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex justify-center"
            >
              <div className="rounded-full bg-zinc-800 p-6">
                <Heart className="h-16 w-16 text-zinc-500" />
              </div>
            </motion.div>

            {/* Message */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <h2 className="text-2xl font-bold">Better Luck Next Time!</h2>
              <p className="text-zinc-400">
                You didn't win this round, but here's a consolation reward
              </p>
            </motion.div>

            {/* Token Reward */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="rounded-lg bg-violet-600/20 border border-violet-500/30 p-4"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coins className="h-5 w-5 text-violet-400" />
                <span className="text-sm text-zinc-400">Consolation Reward</span>
              </div>
              <p className="text-3xl font-bold text-violet-400">
                +{tokenReward} TKT
              </p>
            </motion.div>

            {/* Encouragement */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center gap-2 text-sm text-zinc-500"
            >
              <Star className="h-4 w-4" />
              <span>Keep participating to earn more tokens and XP!</span>
            </motion.div>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={onComplete}
              >
                Continue
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
