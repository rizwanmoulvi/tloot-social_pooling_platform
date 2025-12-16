import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { motion } from "framer-motion";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  isLoading?: boolean;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, isLoading, children, disabled, style, ...props }, ref) => {
    const baseStyles: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      whiteSpace: "nowrap",
      fontSize: "14px",
      fontWeight: 600,
      borderRadius: "8px",
      cursor: disabled || isLoading ? "not-allowed" : "pointer",
      opacity: disabled || isLoading ? 0.5 : 1,
      transition: "all 0.2s ease",
      border: "2px solid",
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
    };
    
    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        backgroundColor: "#000000",
        color: "#ffffff",
        borderColor: "#000000",
      },
      outline: {
        backgroundColor: "transparent",
        color: "#000000",
        borderColor: "#000000",
      },
      ghost: {
        backgroundColor: "transparent",
        color: "#000000",
        borderColor: "transparent",
      },
      secondary: {
        backgroundColor: "#f5f5f5",
        color: "#000000",
        borderColor: "#f5f5f5",
      },
    };
    
    const sizeStyles: Record<string, React.CSSProperties> = {
      default: { height: "44px", padding: "0 24px" },
      sm: { height: "36px", padding: "0 16px", fontSize: "12px" },
      lg: { height: "52px", padding: "0 32px", fontSize: "16px" },
      icon: { height: "44px", width: "44px", padding: "0" },
    };

    const combinedStyles = {
      ...baseStyles,
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...style,
    };

    if (asChild) {
      return <Slot ref={ref} style={combinedStyles} {...props}>{children}</Slot>;
    }

    return (
      <motion.button
        ref={ref}
        style={combinedStyles}
        disabled={disabled || isLoading}
        whileHover={{ scale: 1.02, backgroundColor: variant === "default" ? "#333333" : "#f0f0f0" }}
        whileTap={{ scale: 0.98 }}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {isLoading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ width: 16, height: 16, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%" }}
            />
            Loading...
          </>
        ) : children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { Button };
