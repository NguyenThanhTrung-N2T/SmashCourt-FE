"use client";

import { Fragment } from "react";
import { CheckCircle } from "@phosphor-icons/react";

interface Step {
  number: number;
  label: string;
}

interface BookingStepIndicatorProps {
  currentStep: number;
  steps: Step[];
}

export function BookingStepIndicator({ currentStep, steps }: BookingStepIndicatorProps) {
  return (
    <div className="flex items-center justify-between pb-6 pt-2">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isCurrent = currentStep === step.number;
        const isUpcoming = currentStep < step.number;

        return (
          <Fragment key={step.number}>
            {/* Step Circle */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`
                  flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold text-sm transition-all
                  ${isCompleted ? "border-primary bg-primary text-white" : ""}
                  ${isCurrent ? "border-primary bg-primary/10 text-primary scale-110" : ""}
                  ${isUpcoming ? "border-border bg-surface-2 text-muted" : ""}
                `}
              >
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5" weight="fill" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`
                  absolute top-12 text-xs font-bold whitespace-nowrap
                  ${isCurrent ? "text-primary" : "text-muted"}
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  h-0.5 flex-1 mx-2 transition-all
                  ${isCompleted ? "bg-primary" : "bg-border"}
                `}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
