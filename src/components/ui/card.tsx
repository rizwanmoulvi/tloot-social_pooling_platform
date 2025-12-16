"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  children: React.ReactNode;
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, hover = true, style, ...props }, ref) => {
    const cardStyle: React.CSSProperties = {
      backgroundColor: "#ffffff",
      border: "2px solid #000000",
      overflow: "hidden",
      transition: "all 0.3s ease",
      ...style,
    };

    if (hover) {
      return (
        <motion.div
          ref={ref}
          style={cardStyle}
          whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} style={cardStyle} {...props}>
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ style, ...props }, ref) => (
  <div
    ref={ref}
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      padding: "24px",
      ...style,
    }}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ style, ...props }, ref) => (
  <h3
    ref={ref}
    style={{
      fontSize: "20px",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.5px",
      ...style,
    }}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ style, ...props }, ref) => (
  <p
    ref={ref}
    style={{
      fontSize: "14px",
      color: "#666666",
      ...style,
    }}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ style, ...props }, ref) => (
  <div
    ref={ref}
    style={{
      padding: "0 24px 24px",
      ...style,
    }}
    {...props}
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ style, ...props }, ref) => (
  <div
    ref={ref}
    style={{
      display: "flex",
      alignItems: "center",
      padding: "0 24px 24px",
      ...style,
    }}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
