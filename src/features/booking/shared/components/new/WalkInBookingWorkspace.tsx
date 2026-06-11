"use client";

import { useCallback, useRef, useMemo, useState, useEffect, type FormEvent } from "react";
import {
  CalendarBlank, CheckCircle, CourtBasketball, CreditCard, User, Spinner
} from "@phosphor-icons/react";
import { createWalkInBooking } from "@/src/api/booking.api";
import { Button, Checkbox, Input, Select } from "@/src/shared/components/ui";
import type { CourtDto } from "@/src/features/court/shared/types/court.types";
import type { CreateWalkInBookingDto } from "@/src/features/booking/shared/types/booking.types";
import { InteractiveTimeGrid } from "@/src/features/booking/shared/components/new/InteractiveTimeGrid";
import { fetchCourts } from "@/src/api/court.api";
import { CustomerSearchDto } from "@/src/features/customer/shared/types/customer.types";
import {
  FormErrors, WalkInBookingWorkspaceProps, WalkInBookingFormState, CustomerMode,
} from "@/src/features/booking/shared/types/walkinBooking.types";
import { ModeSwitch, GuestPane, CustomerPane } from "@/src/features/booking/shared/components/new";
import { usePriceCalculation } from "@/src/features/booking/customer/hooks/usePriceCalculation";
import { formatTime } from "@/src/shared/utils/date";
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toApiTime(time: string): string {
  return time.length === 5 ? `${time}:00` : time;
}

function formatWorkspaceTitle(): string {
  const now = new Date();
  const hhmm = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  if (now) return `Tại quầy - ${hhmm}`;
  return "Đặt tại quầy";
}

export function WalkInBookingWorkspace({
  branchId, branchName, form, selectedCourtTypeId,
  onCourtTypeChange, onChange, onDirtyChange, onTitleChange, onCreated, onError,
}: WalkInBookingWorkspaceProps) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingCourts, setLoadingCourts] = useState(false);
  const [courts, setCourts] = useState<CourtDto[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSearchDto | null>(null);
  const { totalAmount, isCalculatingPrice } = usePriceCalculation({
    selectedBranchId: branchId,
    selectedCourtIds: form.courtIds,
    selectedDate: form.bookingDate,
    selectedSlots: form.selectedSlots,
  });
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingCourts(true);
        const data = await fetchCourts(branchId);
        setCourts(data || []);
      } catch {
        setCourts([]);
      } finally {
        setLoadingCourts(false);
      }
    };
    load();
  }, [branchId]);

  const formRef = useRef(form);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const courtTypes = useMemo(() => {
    const map = new Map<string, string>();
    courts.forEach((c) => {
      if (c.courtTypeId && c.courtTypeName) map.set(c.courtTypeId, c.courtTypeName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [courts]);

  const filteredCourts = useMemo(
    () => selectedCourtTypeId === "all" ? courts : courts.filter((c) => c.courtTypeId === selectedCourtTypeId),
    [courts, selectedCourtTypeId],
  );

  // All courts currently in the selection
  const selectedCourts = useMemo(
    () => courts.filter((c) => form.courtIds.includes(c.id)),
    [courts, form.courtIds],
  );

  const updateForm = useCallback(
    (patch: Partial<WalkInBookingFormState>) => {
      const next = { ...formRef.current, ...patch };
      formRef.current = next;
      onChange(next);
      onDirtyChange(true);
      onTitleChange(formatWorkspaceTitle());
    },
    [onChange, onDirtyChange, onTitleChange],
  );

  // ---------------------------------------------------------------------------
  // Multi-court handlers (mirrors useBookingForm logic)
  // ---------------------------------------------------------------------------

  /**
   * Fired when the user drags on a court track.
   * - Already selected → keep the multi-selection, clear slots for re-drag.
   * - New court       → reset to just this court.
   */
  const handleDragCourt = useCallback((court: CourtDto) => {
    const current = formRef.current;
    const alreadySelected = current.courtIds.includes(court.id);

    if (!alreadySelected) {
      updateForm({ courtIds: [court.id] });
    }
  }, [updateForm]);

  /**
   * Fired when the user clicks the candidate (light-green) zone on a court.
   * Toggles that court in/out of the shared time range.
   */
  const handleToggleCourt = useCallback((court: CourtDto) => {
    const current = formRef.current;
    const isSelected = current.courtIds.includes(court.id);

    if (isSelected) {
      const nextIds = current.courtIds.filter((id) => id !== court.id);
      updateForm({
        courtIds: nextIds,
        ...(nextIds.length === 0 ? { selectedSlots: [], startTime: "", endTime: "" } : {}),
      });
    } else {
      updateForm({ courtIds: [...current.courtIds, court.id] });
    }
  }, [updateForm]);

  // ---------------------------------------------------------------------------
  // Mode
  // ---------------------------------------------------------------------------

  const handleModeChange = (mode: CustomerMode) => {
    setSelectedCustomer(null);
    updateForm({ customerMode: mode, customerId: null, guestName: "", guestPhone: "", guestEmail: "", note: "" });
  };

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!form.bookingDate) errs.bookingDate = "Ngày đặt sân là bắt buộc";
    if (form.courtIds.length === 0) errs.courtIds = "Vui lòng chọn sân";  // ← was courtId
    if (!form.startTime) errs.startTime = "Thời gian bắt đầu là bắt buộc";
    if (!form.endTime) errs.endTime = "Thời gian kết thúc là bắt buộc";
    if (form.startTime && form.endTime && form.endTime <= form.startTime)
      errs.endTime = "Thời gian kết thúc phải sau thời gian bắt đầu";
    if (form.customerMode === "guest") {
      if (!form.guestName.trim()) errs.guestName = "Vui lòng nhập tên khách hàng";
    } else {
      if (!form.customerId) errs.customerId = "Vui lòng chọn khách hàng từ danh sách";
    }
    return errs;
  };

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: CreateWalkInBookingDto = {
      bookingDate: form.bookingDate,
      // All selected courts share the same time range
      courts: form.courtIds.map((courtId) => ({
        courtId,
        startTime: toApiTime(form.startTime),
        endTime: toApiTime(form.endTime),
      })),
      customerId: form.customerId || null,
      guestName: form.guestName.trim() || null,
      guestPhone: form.guestPhone.trim() || null,
      guestEmail: form.guestEmail.trim() || null,
      promotionId: null,
      note: form.note.trim() || null,
      payNow: form.payNow,
    };

    try {
      setSubmitting(true);
      const booking = await createWalkInBooking(payload);
      onDirtyChange(false);
      onCreated(booking);
    } catch (error: unknown) {
      onError(error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Submit guard
  // ---------------------------------------------------------------------------

  const canSubmit =
    !loadingCourts &&
    courts.length > 0 &&
    form.courtIds.length > 0 &&        // ← added
    form.selectedSlots.length > 0 &&
    (form.customerMode === "guest"
      ? form.guestName.trim().length > 0
      : Boolean(form.customerId));

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Schedule section */}
      <section className="rounded-xl border border-border bg-surface-1 p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CourtBasketball className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Lịch trình</h2>
            <p className="text-sm font-medium text-muted">
              {branchName || "Chi nhánh được chọn"}
            </p>
          </div>
        </div>

        <div className="mb-5 grid max-w-2xl gap-4 md:grid-cols-2">
          <Input
            label="Ngày đặt sân"
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={form.bookingDate}
            onChange={(e) =>
              updateForm({ bookingDate: e.target.value, selectedSlots: [], startTime: "", endTime: "" })
            }
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
                  if (val !== "all") {
                    const hasConflict = form.courtIds.some((id) => {
                      const c = courts.find((c) => c.id === id);
                      return c && c.courtTypeId !== val;
                    });
                    if (hasConflict) {
                      updateForm({ courtIds: [], selectedSlots: [], startTime: "", endTime: "" });
                    }
                  }
                }}
              >
                <option value="all">Tất cả</option>
                {courtTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
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
              selectedCourtIds={form.courtIds}
              selectedSlots={form.selectedSlots}
              onDragCourt={handleDragCourt}      // ← was: onSelectCourt
              onToggleCourt={handleToggleCourt}  // ← new
              onSlotsChange={(slots) =>
                updateForm({
                  selectedSlots: slots,
                  startTime: slots.length > 0 ? slots[0].startTime : "",
                  endTime: slots.length > 0 ? slots[slots.length - 1].endTime : "",
                })
              }
            />
            {(errors.courtIds || errors.startTime || errors.endTime) && (
              <p className="text-xs font-medium text-red-500">
                {errors.courtIds || errors.startTime || errors.endTime}
              </p>
            )}
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border bg-surface-2 text-sm font-medium text-muted">
            Vui lòng chọn chi nhánh để xem lịch sân
          </div>
        )}
      </section>

      {/* Customer + Payment row */}
      <div className="grid gap-4 lg:grid-cols-[1fr_0.75fr]">
        <section className="rounded-xl border border-border bg-surface-1 p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Thông tin khách hàng</h2>
              <p className="text-sm font-medium text-muted">Khách vãng lai hoặc khách có tài khoản</p>
            </div>
          </div>
          <div className="mb-5">
            <ModeSwitch value={form.customerMode} onChange={handleModeChange} />
          </div>
          {form.customerMode === "guest" ? (
            <GuestPane form={form} errors={errors} updateForm={updateForm} />
          ) : (
            <CustomerPane
              form={form} errors={errors} updateForm={updateForm}
              selectedCustomer={selectedCustomer} setSelectedCustomer={setSelectedCustomer}
            />
          )}
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
              onChange={(e) => updateForm({ payNow: e.target.checked })}
              label="Thanh toán ngay"
              description="Bỏ chọn nếu khách sẽ thanh toán sau"
            />

            {/* Booking summary — now multi-court aware */}
            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Xác nhận</p>
              {selectedCourts.length > 0 ? (
                <>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {selectedCourts.length > 1
                      ? `${selectedCourts.length} sân: ${selectedCourts.map((c) => c.name).join(", ")}`
                      : selectedCourts[0].name}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {new Intl.DateTimeFormat("en-GB").format(new Date(form.bookingDate))}
                    {form.startTime && form.endTime ? ` · ${formatTime(form.startTime)} – ${formatTime(form.endTime)}` : ""}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm font-semibold text-foreground">
                  Không có sân và khung giờ nào được chọn
                </p>
              )}
            </div>
          </div>
          {/* Live Summary Bar */}
          {form && form.selectedSlots && form.selectedSlots.length > 0 && (
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-sm">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted">Tạm tính</h3>
                <p className="mt-1 font-medium text-foreground">
                  {form.selectedSlots.length} slot ·{" "}
                  {form.courtIds.length} sân đã chọn
                </p>
              </div>
              <div className="text-right">
                {isCalculatingPrice ? (
                  <div className="flex items-center justify-end gap-2 text-primary">
                    <Spinner />
                    <span className="text-sm font-medium">Đang tính...</span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    {totalAmount.toLocaleString("vi-VN")} đ
                  </span>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Submit bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-1 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted">
          <CheckCircle className="h-5 w-5 text-primary" />
          Tạo đơn khi đã có lịch sân, thông tin khách hàng và thanh toán
        </div>
        <Button type="submit" isLoading={submitting} disabled={!canSubmit}>
          Tạo đơn đặt tại quầy
        </Button>
      </div>
    </form>
  );
}