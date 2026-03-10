import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-indigo-600 text-white",
        secondary: "border-transparent bg-gray-700 text-gray-100",
        destructive: "border-transparent bg-red-600 text-white",
        outline: "border-gray-600 text-gray-100",
        success: "border-transparent bg-green-700 text-white",
        warning: "border-transparent bg-yellow-600 text-white",
        info: "border-transparent bg-blue-600 text-white",
        teal: "border-transparent bg-teal-700 text-white",
        purple: "border-transparent bg-purple-700 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
