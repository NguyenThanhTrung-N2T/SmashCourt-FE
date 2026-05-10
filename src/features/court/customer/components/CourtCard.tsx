/**
 * CourtCard Component
 * 
 * Displays a court card with selection capability.
 */

"use client";

import { CheckCircle, Circle } from "@phosphor-icons/react";
import { Badge } from "@/src/shared/components/ui/Badge";
import type { CourtDto } from "../../types/court.types";
import { getCourtStatusConfig, canBookCourt } from "../utils/courtStatus";

interface CourtCardProps {
  court: CourtDto;
  isSelected?: boolean;
  onSelect?: (court: CourtDto) => void;
  disabled?: boolean;
}

export function CourtCard({
  court,
  isSelected = false,
  onSelect,
  disabled = false,
}: CourtCardProps) {
  const statusConfig = getCourtStatusConfig(court.status);
  const isAvailable = canBookCourt(court.status);
  const isClickable = onSelect && isAvailable && !disabled;

  const handleClick = () => {
    if (isClickable) {
      onSelect(court);
    }
  };

  return (
    <div
      className={`
        rounded-xl border-2 bg-surface-1 p-4 shadow-sm transition-all
        ${isClickable ? "cursor-pointer hover:shadow-md hover:border-primary/40" : ""}
        ${isSelected ? "border-primary bg-primary/5" : "border-border"}
        ${disabled || !isAvailable ? "opacity-60" : ""}
      `}
      onClick={handleClick}
    >
      {/* Image */}
      {court.avatarUrl && (
        <div className="mb-3 aspect-video overflow-hidden rounded-lg bg-surface-2">
          <img
            src={court.avatarUrl}
            alt={court.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-2 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground">{court.name}</h3>
          <Badge variant="info" size="sm" className="mt-1">
            {court.courtTypeName}
          </Badge>
        </div>
        {isClickable && (
          <div className="ml-2">
            {isSelected ? (
              <CheckCircle className="h-6 w-6 text-primary" weight="fill" />
            ) : (
              <Circle className="h-6 w-6 text-muted" />
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {court.description && (
        <p className="mb-3 text-sm text-muted line-clamp-2">
          {court.description}
        </p>
      )}

      {/* Status */}
      <Badge variant={statusConfig.variant} size="sm" dot>
        {statusConfig.label}
      </Badge>
    </div>
  );
}
