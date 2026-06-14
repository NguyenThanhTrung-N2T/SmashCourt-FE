/**
 * useTimeSlotManagement Hook
 * 
 * Hook for managing time slots (create, update, delete).
 * Owner only.
 */

import { useState } from "react";
import {
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
} from "@/src/api/timeslot.api";
import type {
  TimeSlotDto,
  CreateTimeSlotDto,
  UpdateTimeSlotDto,
} from "../types/timeslot.types";

export function useTimeSlotManagement() {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (dto: CreateTimeSlotDto): Promise<TimeSlotDto | null> => {
    try {
      setIsCreating(true);
      setError(null);
      const result = await createTimeSlot(dto);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Không thể tạo khung giờ";
      setError(errorMessage);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const update = async (
    id: string,
    dto: UpdateTimeSlotDto
  ): Promise<TimeSlotDto | null> => {
    try {
      setIsUpdating(true);
      setError(null);
      const result = await updateTimeSlot(id, dto);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Không thể cập nhật khung giờ";
      setError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const remove = async (id: string): Promise<void> => {
    try {
      setIsDeleting(true);
      setError(null);
      await deleteTimeSlot(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Không thể xóa khung giờ";
      setError(errorMessage);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    create,
    update,
    remove,
    isCreating,
    isUpdating,
    isDeleting,
    error,
  };
}
