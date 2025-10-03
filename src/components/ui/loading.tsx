import * as React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "futuristic" | "dots";
}

export function LoadingSpinner({ 
  className, 
  size = "md", 
  variant = "default",
  ...props 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  if (variant === "dots") {
    return (
      <div className={cn("flex space-x-1", className)} {...props}>
        <div className="h-2 w-2 bg-primary rounded-full animate-loading-dots" style={{ animationDelay: "0ms" }} />
        <div className="h-2 w-2 bg-primary rounded-full animate-loading-dots" style={{ animationDelay: "150ms" }} />
        <div className="h-2 w-2 bg-primary rounded-full animate-loading-dots" style={{ animationDelay: "300ms" }} />
      </div>
    );
  }

  if (variant === "futuristic") {
    return (
      <div className={cn("relative", sizeClasses[size], className)} {...props}>
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-loading-spinner" />
        <div className="absolute inset-1 rounded-full border border-primary/30 animate-futuristic-pulse" />
      </div>
    );
  }

  return (
    <div className={cn("animate-loading-spinner rounded-full border-2 border-primary/20 border-t-primary", sizeClasses[size], className)} {...props} />
  );
}

interface LoadingTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  variant?: "default" | "futuristic";
}

export function LoadingText({ 
  className, 
  text = "Loading...", 
  variant = "default",
  ...props 
}: LoadingTextProps) {
  if (variant === "futuristic") {
    return (
      <div className={cn("flex items-center space-x-2", className)} {...props}>
        <LoadingSpinner variant="futuristic" size="sm" />
        <span className="text-sm text-muted-foreground animate-futuristic-pulse">{text}</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center space-x-2", className)} {...props}>
      <LoadingSpinner size="sm" />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
}

interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
  variant?: "default" | "futuristic";
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  text = "Loading...", 
  variant = "default",
  className,
  ...props 
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)} {...props}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-3">
            <LoadingSpinner variant={variant} size="lg" />
            <span className="text-sm text-muted-foreground">{text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
