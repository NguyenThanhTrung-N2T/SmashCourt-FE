/**
 * CourtSelection Component
 * 
 * Component for selecting courts with time slots for booking.
 */

"use client";

import { useState } from "react";
import { CalendarBlank, Clock, Plus, Trash, MapPin } from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";
import { Input } from "@/src/shared/components/ui/Input";
import { Alert } from "@/src/shared/components/ui/Alert";
import { Spinner } from "@/src/shared/components/feedback/Spinner";
import { EmptyState } from "@/src/shared/components/layout/EmptyState";
import { CourtCard } from "./CourtCard";
import { useCourts } from "../hooks/useCourts";
import { formatCurrency } from "@/src/features/booking/customer/utils/bookingStatus";
import type { CourtDto } from "../../types/court.types";

interface SelectedCourtSlot {
  court: CourtDto;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  price: number;
}

interface CourtSelectionProps {
  branchId: string;
  branchName: string;
  bookingDate: string; // YYYY-MM-DD
  onDateChange: (date: string) => void;
  selectedSlots: SelectedCourtSlot[];
  onSlotsChange: (slots: SelectedCourtSlot[]) => void;
  pricePerHour?: number; // Default price per hour if not provided by API
}

export function CourtSelection({
  branchId,
  branchName,
  bookingDate,
  onDateChange,
  selectedSlots,
  onSlotsChange,
  pricePerHour = 100000,
}: CourtSelectionProps) {
  const { courts, isLoading, error } = useCourts({ branchId });
  const [expandedSlotIndex, setExpandedSlotIndex] = useState<number | null>(null);

  const handleCourtSelect = (court: CourtDto) => {
    // Check if court is already selected
    const existingIndex = selectedSlots.findIndex((s) => s.court.id === court.id);

    if (existingIndex >= 0) {
      // Remove if already selected
      onSlotsChange(selectedSlots.filter((_, i) => i !== existingIndex));
    } else {
      // Add with default time slots
      const newSlot: SelectedCourtSlot = {
        court,
        startTime: "08:00",
        endTime: "10:00",
        price: calculatePrice("08:00", "10:00", pricePerHour),
      };
      onSlotsChange([...selectedSlots, newSlot]);
      setExpandedSlotIndex(selectedSlots.length);
    }
  };

  const handleRemoveSlot = (index: number) => {
    onSlotsChange(selectedSlots.filter((_, i) => i !== index));
    if (expandedSlotIndex === index) {
      setExpandedSlotIndex(null);
    }
  };

  const handleTimeChange = (
    index: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const updated = [...selectedSlots];
    updated[index] = {
      ...updated[index],
      [field]: value,
      price: calculatePrice(
        field === "startTime" ? value : updated[index].startTime,
        field === "endTime" ? value : updated[index].endTime,
        pricePerHour
      ),
    };
    onSlotsChange(updated);
  };

  const calculatePrice = (startTime: string, endTime: string, hourlyRate: number): number => {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const hours = endHour - startHour + (endMin - startMin) / 60;
    return Math.max(0, hours * hourlyRate);
  };

  const totalAmount = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);

  const isCourtSelected = (courtId: string) => {
    return selectedSlots.some((s) => s.court.id === courtId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Lỗi">
        {error}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Branch & Date Selection */}
      <div className="rounded-xl border-2 border-border bg-surface-1 p-6">
        <div className="mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">{branchName}</h2>
        </div>
        <Input
          label="Ngày đặt sân"
          type="date"
          value={bookingDate}
          onChange={(e) => onDateChange(e.target.value)}
          leftIcon={<CalendarBlank className="h-4 w-4" />}
          required
        />
      </div>

      {/* Available Courts */}
      <div className="rounded-xl border-2 border-border bg-surface-1 p-6">
        <h2 className="mb-4 text-xl font-bold text-foreground">
          Chọn sân ({courts.length} sân có sẵn)
        </h2>

        {courts.length === 0 ? (
          <EmptyState
            icon={<MapPin className="h-12 w-12" />}
            title="Không có sân nào"
            description="Hiện tại không có sân nào có sẵn tại chi nhánh này."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courts.map((court) => (
              <CourtCard
                key={court.id}
                court={court}
                isSelected={isCourtSelected(court.id)}
                onSelect={handleCourtSelect}
                disabled={!bookingDate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Selected Courts with Time Slots */}
      {selectedSlots.length > 0 && (
        <div className="rounded-xl border-2 border-border bg-surface-1 p-6">
          <h2 className="mb-4 text-xl font-bold text-foreground">
            Sân đã chọn ({selectedSlots.length})
          </h2>
          <div className="space-y-3">
            {selectedSlots.map((slot, index) => (
              <div
                key={index}
                className="rounded-lg border-2 border-border bg-surface-2 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-foreground">{slot.court.name}</h3>
                    <p className="text-sm text-muted">{slot.court.courtTypeName}</p>
                  </div>
                  <Button
                    variant="dangerSoft"
                    size="sm"
                    leftIcon={<Trash className="h-4 w-4" />}
                    onClick={() => handleRemoveSlot(index)}
                  >
                    Xóa
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Giờ bắt đầu"
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => handleTimeChange(index, "startTime", e.target.value)}
                    leftIcon={<Clock className="h-4 w-4" />}
                  />
                  <Input
                    label="Giờ kết thúc"
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => handleTimeChange(index, "endTime", e.target.value)}
                    leftIcon={<Clock className="h-4 w-4" />}
                  />
                </div>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-muted">Giá sân</span>
                  <span className="font-bold text-primary">
                    {formatCurrency(slot.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-4 rounded-lg bg-primary/10 p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-foreground">Tổng tiền</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Info Alert */}
      {!bookingDate && (
        <Alert variant="info" title="Thông báo">
          Vui lòng chọn ngày đặt sân trước khi chọn sân.
        </Alert>
      )}

      {selectedSlots.length === 0 && bookingDate && (
        <Alert variant="info" title="Thông báo">
          Vui lòng chọn ít nhất một sân để tiếp tục.
        </Alert>
      )}
    </div>
  );
}
