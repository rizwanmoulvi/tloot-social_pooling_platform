"use client";

import React from "react";
import { Inbox } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px",
        textAlign: "center",
      }}
    >
      <div style={{
        backgroundColor: "#f5f5f5",
        padding: "16px",
        borderRadius: "50%",
        marginBottom: "16px",
      }}>
        {icon || <Inbox size={40} color="#999999" />}
      </div>
      <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>{title}</h3>
      {description && (
        <p style={{ color: "#666666", marginBottom: "24px", maxWidth: "400px", fontSize: "14px" }}>
          {description}
        </p>
      )}
      {action}
    </motion.div>
  );
}
