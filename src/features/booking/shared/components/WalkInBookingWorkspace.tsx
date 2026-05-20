"use client";

import { useCallback, useMemo, useState, useEffect, type FormEvent } from "react";
import {
  CalendarBlank,
  CheckCircle,
  Clock,
  CourtBasketball,
  CreditCard,
  User,
} from "@phosphor-icons/react";
import { createWalkInBooking } from "@/src/api/booking.api";
import { Button, Checkbox, Input, Select, Textarea } from "@/src/shared/components/ui";
import type { CourtDto } from "@/src/features/court/shared/types/court.types";
import type { BookingDto, CreateWalkInBookingDto } from "@/src/features/booking/shared/types/booking.types";
import type { TimeGridSlotDto } from "@/src/features/timeslot/types";
import { InteractiveTimeGrid } from "@/src/features/booking/shared/components";
import { fetchCourts } from '@/src/api/court.api';

export type WalkInBookingFormState = {
  bookingDate: string;
  courtId: string;
  startTime: string;
  endTime: string;
  selectedSlots: TimeGridSlotDto[];
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  note: string;
  payNow: boolean;
};

export const createDefaultWalkInForm = (): WalkInBookingFormState => ({
  bookingDate: new Date().toISOString().split("T")[0],
  courtId: "",
  startTime: "",
  endTime: "",
  selectedSlots: [],
  guestName: "",
  guestPhone: "",
  guestEmail: "",
  note: "",
  payNow: true,
});

interface WalkInBookingWorkspaceProps {
  branchId: string;
  branchName?: string;
  form: WalkInBookingFormState;
  selectedCourtTypeId: string;
  onCourtTypeChange: (value: string) => void;
  onChange: (form: WalkInBookingFormState) => void;
  onDirtyChange: (dirty: boolean) => void;
  onTitleChange: (title: string) => void;
  onCreated: (booking: BookingDto) => void;
  onError: (message: string) => void;
}

type FormErrors = Partial<Record<keyof WalkInBookingFormState, string>>;

function toApiTime(time: string): string {
  return time.length === 5 ? `${time}:00` : time;
}

function selectedCourtName(courts: CourtDto[], courtId: string): string {
  return courts.find((court) => court.id === courtId)?.name || "";
}

function formatWorkspaceTitle(form: WalkInBookingFormState, courts: CourtDto[]): string {
  const courtName = selectedCourtName(courts, form.courtId);
  const time = form.startTime || "new";

  if (courtName && form.startTime) return `Tại quầy - ${courtName} - ${time}`;
  if (courtName) return `Tại quầy - ${courtName}`;
  return "Đặt tại quầy";
}

export function WalkInBookingWorkspace({
  branchId,
  branchName,
  form,
  selectedCourtTypeId,
  onCourtTypeChange,
  onChange,
  onDirtyChange,
  onTitleChange,
  onCreated,
  onError,
}: WalkInBookingWorkspaceProps) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const [loadingCourts, setLoadingCourts] = useState(false);
  const [courts, setCourts] = useState<CourtDto[]>([]);

  const courtTypes = useMemo(() => {
    const typesMap = new Map<string, string>();
    courts.forEach(c => {
      if (c.courtTypeId && c.courtTypeName) {
        typesMap.set(c.courtTypeId, c.courtTypeName);
      }
    });
    return Array.from(typesMap.entries()).map(([id, name]) => ({ id, name }));
  }, [courts]);

  useEffect(() => {
    const loadCourts = async () => {
      try {
        setLoadingCourts(true);
        const data = await fetchCourts(branchId);
        setCourts(data || []);
      } catch (error) {
        console.error('Failed to load courts:', error);
        setCourts([]);
      } finally {
        setLoadingCourts(false);
      }
    };
    loadCourts();
  }, [branchId]);

  const filteredCourts = useMemo(() => {
    if (selectedCourtTypeId === "all") return courts;
    return courts.filter(c => c.courtTypeId === selectedCourtTypeId);
  }, [courts, selectedCourtTypeId]);

  const selectedCourt = useMemo(
    () => courts.find((court) => court.id === form.courtId),
    [courts, form.courtId],
  );

  const updateForm = useCallback((patch: Partial<WalkInBookingFormState>) => {
    const nextForm = { ...form, ...patch };
    onChange(nextForm);
    onDirtyChange(true);
    onTitleChange(formatWorkspaceTitle(nextForm, courts));
  }, [form, onChange, onDirtyChange, onTitleChange, courts]);

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!form.bookingDate) nextErrors.bookingDate = "Ngày đặt sân là bắt buộc";
    if (!form.courtId) nextErrors.courtId = "Vui lòng chọn sân";
    if (!form.startTime) nextErrors.startTime = "Thời gian bắt đầu vào chơi là bắt buộc";
    if (!form.endTime) nextErrors.endTime = "Thời gian kết thúc là bắt buộc";
    if (form.startTime && form.endTime && form.endTime <= form.startTime) {
      nextErrors.endTime = "Thời gian kết thúc phải sau thời gian bắt đầu";
    }
    if (!form.guestName.trim()) {
      nextErrors.guestName = "Vui lòng nhập tên khách hàng"; //TODO
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: CreateWalkInBookingDto = {
      bookingDate: form.bookingDate,
      courts: [
        {
          courtId: form.courtId,
          startTime: toApiTime(form.startTime),
          endTime: toApiTime(form.endTime),
        },
      ],
      customerId: null, // TODO
      guestName: form.guestName.trim() || null,
      guestPhone: form.guestPhone.trim() || null,
      guestEmail: form.guestEmail.trim() || null,
      promotionId: null, // TODO
      note: form.note.trim() || null,
      payNow: form.payNow,
    };

    try {
      setSubmitting(true);
      const booking = await createWalkInBooking(payload);
      onDirtyChange(false);
      onCreated(booking);
    } catch (error) {
      console.error("Đã xảy ra lỗi khi đặt sân:", error);
      onError("Đã xảy ra lỗi khi đặt sân");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-xl border border-border bg-surface-1 p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CourtBasketball className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Lịch trình</h2>
            <p className="text-sm font-medium text-muted">
              Sân và khung giờ {branchName || "Chi nhánh được chọn"}
            </p>
          </div>
        </div>

        <div className="mb-5 grid max-w-2xl gap-4 md:grid-cols-2">
          <Input
            label="Ngày đặt sân"
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={form.bookingDate}
            onChange={(event) => updateForm({ bookingDate: event.target.value, selectedSlots: [], startTime: "", endTime: "" })}
            error={errors.bookingDate}
            leftIcon={<CalendarBlank className="h-4 w-4" />}
          />

          {courtTypes.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">
                Loại sân
              </label>
              <Select
                value={selectedCourtTypeId}
                onChange={(val) => {
                  onCourtTypeChange(val);
                  if (val !== "all" && form.courtId) {
                    const court = courts.find(c => c.id === form.courtId);
                    if (court && court.courtTypeId !== val) {
                      updateForm({ courtId: "", selectedSlots: [], startTime: "", endTime: "" });
                    }
                  }
                }}
              >
                <option value="all">Tất cả</option>
                {courtTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </Select>
            </div>
          )}
        </div>

        {branchId ? (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted">
              Sân và khung giờ <span className="text-red-500">*</span>
            </label>
            <InteractiveTimeGrid
              branchId={branchId}
              courts={filteredCourts}
              selectedDate={form.bookingDate}
              selectedCourtId={form.courtId}
              selectedSlots={form.selectedSlots}
              onSelectCourt={(court) => updateForm({ courtId: court.id })}
              onSlotsChange={(slots) => updateForm({
                selectedSlots: slots,
                startTime: slots.length > 0 ? slots[0].startTime : "",
                endTime: slots.length > 0 ? slots[slots.length - 1].endTime : "",
              })}
            />
            {(errors.courtId || errors.startTime || errors.endTime) && (
              <p className="text-xs font-medium text-red-500">
                {errors.courtId || errors.startTime || errors.endTime}
              </p>
            )}
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border bg-surface-2 text-sm font-medium text-muted">
            Vui lòng chọn chi nhánh để xem lịch sân
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.75fr]">
        <section className="rounded-xl border border-border bg-surface-1 p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Thông tin khách hàng</h2>
              <p className="text-sm font-medium text-muted">Thông tin khách đặt tại quầy</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Tên khách hàng"
              value={form.guestName}
              onChange={(event) => updateForm({ guestName: event.target.value })}
              placeholder="Tên khách hàng"
              error={errors.guestName}
            />
            <Input
              label="Số điện thoại"
              value={form.guestPhone}
              onChange={(event) => updateForm({ guestPhone: event.target.value })}
              placeholder="Số điện thoại"
              error={errors.guestPhone}
            />
          </div>

          <div className="mt-4">
            <Input
              label="Email"
              type="email"
              value={form.guestEmail}
              onChange={(event) => updateForm({ guestEmail: event.target.value })}
              placeholder="guestname@email.com"
            />
          </div>

          <div className="mt-4">
            <Textarea
              label="Lưu ý"
              value={form.note}
              onChange={(event) => updateForm({ note: event.target.value })}
              placeholder="Ghi chú nhân viên, yêu cầu đặc biệt, hoặc những lưu ý khác"
            />
          </div>
        </section>

        <aside className="rounded-xl border border-border bg-surface-1 p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Thanh toán</h2>
              <p className="text-sm font-medium text-muted">Hình thức thanh toán</p>
            </div>
          </div>

          <div className="space-y-4">
            <Checkbox
              checked={form.payNow}
              onChange={(event) => updateForm({ payNow: event.target.checked })}
              label="Thanh toán ngay"
              description="Bỏ chọn nếu khách sẽ thanh toán sau"
            />

            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Xác nhận</p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {selectedCourt?.name || "Không có sân và khung giờ nào được chọn"}
              </p>
              <p className="mt-1 text-sm text-muted">
                {new Intl.DateTimeFormat("en-GB").format(new Date(form.bookingDate)) || "Không có ngày nào được chọn"}
                {form.startTime && form.endTime ? `${form.startTime} - ${form.endTime}` : ""}
              </p>
            </div>
          </div>
        </aside>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-1 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted">
          <CheckCircle className="h-5 w-5 text-primary" />
          Tạo đơn khi đã có lịch sân, thông tin khách hàng và thanh toán
        </div>
        <Button type="submit" isLoading={submitting} disabled={loadingCourts || courts.length === 0 || form.selectedSlots.length === 0 || !form.guestName.trim()}>
          Tạo đơn đặt tại quầy
        </Button>
      </div>
    </form>
  );
}
