"use client";

import React from "react";
import Link from "next/link";
import { Github, Twitter, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerStyle: React.CSSProperties = {
    backgroundColor: "#000000",
    color: "#ffffff",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "48px 24px",
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "32px",
  };

  const socialLinkStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px",
    border: "1px solid #ffffff",
    color: "#ffffff",
    backgroundColor: "transparent",
    transition: "all 0.2s ease",
    cursor: "pointer",
  };

  const linkStyle: React.CSSProperties = {
    color: "rgba(255,255,255,0.7)",
    textDecoration: "none",
    fontSize: "14px",
    transition: "color 0.2s ease",
  };

  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        <div style={gridStyle}>
          {/* Brand */}
          <div style={{ gridColumn: "span 2" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px", textTransform: "uppercase", letterSpacing: "2px" }}>
              TLOOT
            </h3>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", maxWidth: "400px", lineHeight: 1.7 }}>
              Transform event ticketing into a GameFi-powered social experience.
              Pool funds, play games, and access premium events with reduced costs.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "24px" }}>
              <motion.a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                style={socialLinkStyle}
                whileHover={{ backgroundColor: "#ffffff", color: "#000000" }}
                whileTap={{ scale: 0.95 }}
              >
                <Twitter size={20} />
              </motion.a>
              <motion.a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                style={socialLinkStyle}
                whileHover={{ backgroundColor: "#ffffff", color: "#000000" }}
                whileTap={{ scale: 0.95 }}
              >
                <Github size={20} />
              </motion.a>
              <motion.a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                style={socialLinkStyle}
                whileHover={{ backgroundColor: "#ffffff", color: "#000000" }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageCircle size={20} />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: "16px", textTransform: "uppercase", fontSize: "14px", letterSpacing: "1px" }}>Platform</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {["Home", "Browse Pools", "Dashboard", "Rewards"].map((item) => (
                <li key={item}>
                  <Link href={item === "Home" ? "/" : `/${item.toLowerCase().replace(" ", "-")}`} style={linkStyle}>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: "16px", textTransform: "uppercase", fontSize: "14px", letterSpacing: "1px" }}>Resources</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {["Documentation", "FAQ", "Terms of Service", "Privacy Policy"].map((item) => (
                <li key={item}>
                  <a href="#" style={linkStyle}>{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{
          marginTop: "48px",
          paddingTop: "32px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", textTransform: "uppercase" }}>
            © {currentYear} TLOOT. Built on Mantle Network.
          </p>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
            Built for Mantle Hackathon
          </p>
        </div>
      </div>
    </footer>
  );
}
