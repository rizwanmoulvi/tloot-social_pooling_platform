import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = "default", style, ...props }, ref) => {
    const variants: Record<string, React.CSSProperties> = {
      default: { backgroundColor: "#000000", color: "#ffffff", borderColor: "#000000" },
      secondary: { backgroundColor: "#ffffff", color: "#000000", borderColor: "#000000" },
      success: { backgroundColor: "#000000", color: "#ffffff", borderColor: "#000000" },
      warning: { backgroundColor: "#000000", color: "#ffffff", borderColor: "#000000" },
      destructive: { backgroundColor: "#ff0000", color: "#ffffff", borderColor: "#ff0000" },
    };

    const baseStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      border: "2px solid",
      padding: "4px 12px",
      fontSize: "11px",
      fontWeight: 700,
      letterSpacing: "1px",
      textTransform: "uppercase",
      ...variants[variant],
      ...style,
    };

    return (
      <div
        ref={ref}
        style={baseStyle}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
