import * as React from "react"

import { cn } from "@/lib/utils"

type AccentEdge = "left" | "top"

type CardProps = React.ComponentProps<"div"> & {
  accentColor?: string
  accentEdge?: AccentEdge
}

function Card({ className, accentColor, accentEdge = "top", style, ...props }: CardProps) {
  const accentStyle: React.CSSProperties = accentColor
    ? accentEdge === "left"
      ? { borderLeft: `3px solid ${accentColor}`, ...style }
      : { boxShadow: `inset 0 2px 0 0 ${accentColor}`, ...style }
    : (style ?? {})
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-lg border border-border bg-card text-card-foreground shadow-sm",
        "transition-colors",
        className
      )}
      style={accentStyle}
      {...props}
    />
  )
}

function CardHeader({
  className,
  accentColor,
  ...props
}: React.ComponentProps<"div"> & { accentColor?: string }) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col gap-1 px-5 py-4 border-b border-border/60",
        className
      )}
      style={
        accentColor
          ? { borderTop: `2px solid ${accentColor}` }
          : undefined
      }
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-base font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-secondary-fg", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-5 py-4", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("px-5 py-4 border-t border-border/60", className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
