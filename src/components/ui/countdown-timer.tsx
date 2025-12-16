"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  deadline: Date;
  onComplete?: () => void;
  compact?: boolean;
}

export function CountdownTimer({
  deadline,
  onComplete,
  compact = false,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = deadline.getTime() - new Date().getTime();
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false,
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.expired && onComplete) {
        onComplete();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline, onComplete]);

  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  if (timeLeft.expired) {
    return (
      <div style={{ ...containerStyle, color: "#ff0000" }}>
        <Clock size={16} />
        <span style={{ fontSize: "14px", fontWeight: 600 }}>Expired</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div style={containerStyle}>
        <Clock size={16} color="#666666" />
        <span style={{ fontSize: "14px", fontWeight: 600 }}>
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {timeLeft.hours}h {timeLeft.minutes}m
        </span>
      </div>
    );
  }

  const timeBlockStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const numberStyle: React.CSSProperties = {
    fontSize: "24px",
    fontWeight: 700,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "10px",
    color: "#666666",
    textTransform: "uppercase",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <Clock size={20} color="#000000" />
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {timeLeft.days > 0 && (
          <div style={timeBlockStyle}>
            <span style={numberStyle}>{timeLeft.days}</span>
            <span style={labelStyle}>Days</span>
          </div>
        )}
        <div style={timeBlockStyle}>
          <span style={numberStyle}>{String(timeLeft.hours).padStart(2, "0")}</span>
          <span style={labelStyle}>Hours</span>
        </div>
        <span style={{ fontSize: "24px", fontWeight: 700, color: "#cccccc" }}>:</span>
        <div style={timeBlockStyle}>
          <span style={numberStyle}>{String(timeLeft.minutes).padStart(2, "0")}</span>
          <span style={labelStyle}>Min</span>
        </div>
        <span style={{ fontSize: "24px", fontWeight: 700, color: "#cccccc" }}>:</span>
        <div style={timeBlockStyle}>
          <span style={numberStyle}>{String(timeLeft.seconds).padStart(2, "0")}</span>
          <span style={labelStyle}>Sec</span>
        </div>
      </div>
    </div>
  );
}
