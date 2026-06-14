import * as React from "react";
import { cn } from "@/src/shared/utils/cn";

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
  thickness?: "sm" | "md" | "lg";
}

const thicknessMap = {
  sm: "1px",
  md: "2px",
  lg: "4px",
};

export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  ({ className, orientation = "horizontal", thickness = "sm", ...props }, ref) => {
    return (
      <hr
        ref={ref}
        className={cn(
          "border-0 bg-slate-200",
          orientation === "horizontal" ? "w-full" : "h-full",
          className
        )}
        style={{
          [orientation === "horizontal" ? "height" : "width"]: thicknessMap[thickness],
        }}
        {...props}
      />
    );
  }
);

Divider.displayName = "Divider";
