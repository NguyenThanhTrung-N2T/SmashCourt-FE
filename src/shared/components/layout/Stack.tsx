import * as React from "react";
import { cn } from "@/src/shared/utils/cn";

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: "none" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
}

const spacingMap = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

const alignMap = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const justifyMap = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
};

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, spacing = "md", align = "stretch", justify = "start", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col",
          spacingMap[spacing],
          alignMap[align],
          justifyMap[justify],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Stack.displayName = "Stack";
