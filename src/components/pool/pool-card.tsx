"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Pool } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PoolTypeBadge } from "./pool-type-badge";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { Calendar, MapPin, Users, Coins } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { PoolType } from "@/lib/constants";

interface PoolCardProps {
  pool: Pool;
}

export function PoolCard({ pool }: PoolCardProps) {
  const progressPercentage = (pool.currentAmount / pool.targetAmount) * 100;
  const spotsLeft = pool.maxParticipants - pool.currentParticipants;

  const imageContainerStyle: React.CSSProperties = {
    position: "relative",
    height: "220px",
    width: "100%",
    overflow: "hidden",
  };

  const overlayStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2), transparent)",
  };

  const badgeContainerStyle: React.CSSProperties = {
    position: "absolute",
    top: "16px",
    right: "16px",
  };

  const eventNameStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "16px",
    left: "16px",
    right: "16px",
  };

  const contentStyle: React.CSSProperties = {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  };

  const infoRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    color: "#000000",
    fontWeight: 600,
    textTransform: "uppercase",
  };

  const statsRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: "16px",
    borderTop: "2px solid #000000",
    fontSize: "14px",
    fontWeight: 700,
  };

  return (
    <Card>
      {/* Event Header */}
      <div style={imageContainerStyle}>
        <div style={{ backgroundColor: "#000", width: "100%", height: "100%" }} />
        <div style={overlayStyle} />
        
        {/* Badge */}
        <div style={badgeContainerStyle}>
          <PoolTypeBadge type={pool.type} />
        </div>

        {/* Event Name Overlay */}
        <div style={eventNameStyle}>
          <h3 style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#ffffff",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            textShadow: "0 2px 4px rgba(0,0,0,0.5)",
          }}>
            {pool.event.name}
          </h3>
        </div>
      </div>

      <div style={contentStyle}>
        {/* Event Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={infoRowStyle}>
            <Calendar size={16} />
            <span>{format(pool.event.date, "MMM dd, yyyy")}</span>
          </div>
          <div style={infoRowStyle}>
            <MapPin size={16} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {pool.event.venue}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
            <span style={{ fontWeight: 600, textTransform: "uppercase" }}>Progress</span>
            <span style={{ fontWeight: 700 }}>
              {formatCurrency(pool.currentAmount)} / {formatCurrency(pool.targetAmount)}
            </span>
          </div>
          <Progress value={progressPercentage} />
        </div>

        {/* Stats Row */}
        <div style={statsRowStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Users size={16} />
            <span>{pool.currentParticipants}/{pool.maxParticipants}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Coins size={16} />
            <span>{formatCurrency(pool.entryAmount)}</span>
          </div>
        </div>

        {/* Countdown */}
        <CountdownTimer deadline={pool.deadline} compact />

        {/* Additional Info */}
        {pool.type === PoolType.LUCKY_DRAW && (
          <div style={{
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            color: progressPercentage >= 100 ? "#000000" : "#666666",
          }}>
            {progressPercentage >= 100 ? "Draw pending" : `${spotsLeft} spots left`}
          </div>
        )}

        {/* CTA Button */}
        <Link href={`/pools/${pool.id}`} style={{ width: "100%" }}>
          <Button style={{ width: "100%" }} size="lg">
            View Pool
          </Button>
        </Link>
      </div>
    </Card>
  );
}
