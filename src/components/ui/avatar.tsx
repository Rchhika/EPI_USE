import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"
import { getGravatarUrl, getInitials } from "@/utils/gravatar"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

// Enhanced Employee Avatar Component
interface EmployeeAvatarProps {
  employee: {
    name: string;
    surname: string;
    email: string;
  };
  size?: number;
  className?: string;
  showTooltip?: boolean;
}

const EmployeeAvatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  EmployeeAvatarProps
>(({ employee, size = 40, className, showTooltip = false, ...props }, ref) => {
  const gravatarUrl = getGravatarUrl(employee.email, size);
  const initials = getInitials(employee.name, employee.surname);
  const fullName = `${employee.name} ${employee.surname}`;

  return (
    <Avatar
      ref={ref}
      className={cn("ring-2 ring-border hover:ring-primary/20 transition-all duration-200", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <AvatarImage 
        src={gravatarUrl} 
        alt={fullName}
        className="object-cover"
      />
      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
});

EmployeeAvatar.displayName = "EmployeeAvatar";

export { Avatar, AvatarImage, AvatarFallback, EmployeeAvatar }