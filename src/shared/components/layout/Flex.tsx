import * as React from "react";
import { cn } from "@/src/shared/utils/cn";

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: "none" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
  wrap?: "nowrap" | "wrap" | "wrap-reverse";
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

const wrapMap = {
  nowrap: "flex-nowrap",
  wrap: "flex-wrap",
  "wrap-reverse": "flex-wrap-reverse",
};

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ className, spacing = "md", align = "center", justify = "start", wrap = "nowrap", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          spacingMap[spacing],
          alignMap[align],
          justifyMap[justify],
          wrapMap[wrap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Flex.displayName = "Flex";
