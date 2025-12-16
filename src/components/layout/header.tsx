"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ticket, Home, LayoutDashboard, Gift, Menu, X } from "lucide-react";
import { WalletButton } from "./wallet-button";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Pools", href: "/pools", icon: Ticket },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Rewards", href: "/rewards", icon: Gift },
  ];

  const headerStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 50,
    width: "100%",
    backgroundColor: "#000000",
    color: "#ffffff",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 24px",
  };

  const flexRowStyle: React.CSSProperties = {
    display: "flex",
    height: "64px",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const logoStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
    color: "#ffffff",
  };

  const logoIconStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    padding: "8px",
    borderRadius: "8px",
  };

  const navStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  };

  const navLinkStyle = (isActive: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    backgroundColor: isActive ? "#ffffff" : "transparent",
    color: isActive ? "#000000" : "#ffffff",
  });

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <div style={flexRowStyle}>
          {/* Logo */}
          <Link href="/" style={logoStyle}>
            <div style={logoIconStyle}>
              <Ticket style={{ width: 20, height: 20, color: "#000000" }} />
            </div>
            <span style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "1px" }}>
              TLOOT
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav style={{ ...navStyle, display: "none" }} className="md:flex">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <motion.div key={item.href} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href={item.href} style={navLinkStyle(isActive)}>
                    <Icon style={{ width: 16, height: 16 }} />
                    {item.name}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Right Side */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <WalletButton />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: "none",
                padding: "8px",
                backgroundColor: "transparent",
                border: "none",
                color: "#ffffff",
                cursor: "pointer",
              }}
              className="md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                overflow: "hidden",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                paddingTop: "16px",
                paddingBottom: "16px",
              }}
              className="md:hidden"
            >
              {navigation.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        ...navLinkStyle(isActive),
                        width: "100%",
                        padding: "12px 16px",
                        marginBottom: "4px",
                      }}
                    >
                      <Icon style={{ width: 20, height: 20 }} />
                      {item.name}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
