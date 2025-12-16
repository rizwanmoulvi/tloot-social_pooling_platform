"use client";

import * as React from "react";
import { motion } from "framer-motion";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  showLabel?: boolean;
  variant?: "default" | "success" | "warning";
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value = 0, max = 100, showLabel, variant = "default", style, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const containerStyle: React.CSSProperties = {
      width: "100%",
      ...style,
    };

    const trackStyle: React.CSSProperties = {
      position: "relative",
      height: "4px",
      width: "100%",
      overflow: "hidden",
      backgroundColor: "#e5e5e5",
      borderRadius: "2px",
    };

    const barStyle: React.CSSProperties = {
      height: "100%",
      backgroundColor: "#000000",
      borderRadius: "2px",
    };

    return (
      <div ref={ref} style={containerStyle} {...props}>
        <div style={trackStyle}>
          <motion.div
            style={barStyle}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        {showLabel && (
          <p style={{
            marginTop: "6px",
            fontSize: "12px",
            color: "#000000",
            textAlign: "right",
            fontWeight: 700,
            textTransform: "uppercase",
          }}>
            {Math.round(percentage)}%
          </p>
        )}
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
