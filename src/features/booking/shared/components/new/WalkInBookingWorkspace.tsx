"use client";

import { useCallback, useMemo, useState, useEffect, type FormEvent } from "react";
import {
  CalendarBlank,
  CheckCircle,
  CourtBasketball,
  CreditCard,
  User,
} from "@phosphor-icons/react";
import { createWalkInBooking } from "@/src/api/booking.api";
import { Button, Checkbox, Input, Select } from "@/src/shared/components/ui";
import type { CourtDto } from "@/src/features/court/shared/types/court.types";
import type { CreateWalkInBookingDto } from "@/src/features/booking/shared/types/booking.types";
import { InteractiveTimeGrid } from "@/src/features/booking/shared/components/new/InteractiveTimeGrid";
import { fetchCourts } from "@/src/api/court.api";
import { CustomerSearchDto } from "@/src/features/customer/shared/types/customer.types";
import { FormErrors, WalkInBookingWorkspaceProps, WalkInBookingFormState, CustomerMode } from "@/src/features/booking/shared/types/walkinBooking.types";
import { ModeSwitch, GuestPane, CustomerPane } from "@/src/features/booking/shared/components/new";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toApiTime(time: string): string {
  return time.length === 5 ? `${time}:00` : time;
}

function selectedCourtName(courts: CourtDto[], courtId: string): string {
  return courts.find((c) => c.id === courtId)?.name || "";
}

function formatWorkspaceTitle(form: WalkInBookingFormState, courts: CourtDto[]): string {
  const courtName = selectedCourtName(courts, form.courtId);
  const time = form.startTime || "new";
  if (courtName && form.startTime) return `Tại quầy - ${courtName} - ${time}`;
  if (courtName) return `Tại quầy - ${courtName}`;
  return "Đặt tại quầy";
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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

  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerSearchDto | null>(null);

  // Load courts for this branch
  useEffect(() => {
    const loadCourts = async () => {
      try {
        setLoadingCourts(true);
        const data = await fetchCourts(branchId);
        setCourts(data || []);
      } catch (error) {
        console.error("Failed to load courts:", error);
        setCourts([]);
      } finally {
        setLoadingCourts(false);
      }
    };
    loadCourts();
  }, [branchId]);

  const courtTypes = useMemo(() => {
    const map = new Map<string, string>();
    courts.forEach((c) => {
      if (c.courtTypeId && c.courtTypeName) map.set(c.courtTypeId, c.courtTypeName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [courts]);

  const filteredCourts = useMemo(() => {
    if (selectedCourtTypeId === "all") return courts;
    return courts.filter((c) => c.courtTypeId === selectedCourtTypeId);
  }, [courts, selectedCourtTypeId]);

  const selectedCourt = useMemo(
    () => courts.find((c) => c.id === form.courtId),
    [courts, form.courtId],
  );

  const updateForm = useCallback(
    (patch: Partial<WalkInBookingFormState>) => {
      const next = { ...form, ...patch };
      onChange(next);
      onDirtyChange(true);
      onTitleChange(formatWorkspaceTitle(next, courts));
    },
    [form, onChange, onDirtyChange, onTitleChange, courts],
  );

  // When switching mode, reset customer-related fields
  const handleModeChange = (mode: CustomerMode) => {
    setSelectedCustomer(null);
    updateForm({
      customerMode: mode,
      customerId: null,
      guestName: "",
      guestPhone: "",
      guestEmail: "",
      note: "",
    });
  };

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  const validate = (): FormErrors => {
    const errs: FormErrors = {};

    if (!form.bookingDate) errs.bookingDate = "Ngày đặt sân là bắt buộc";
    if (!form.courtId) errs.courtId = "Vui lòng chọn sân";
    if (!form.startTime) errs.startTime = "Thời gian bắt đầu là bắt buộc";
    if (!form.endTime) errs.endTime = "Thời gian kết thúc là bắt buộc";
    if (form.startTime && form.endTime && form.endTime <= form.startTime) {
      errs.endTime = "Thời gian kết thúc phải sau thời gian bắt đầu";
    }

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
      courts: [
        {
          courtId: form.courtId,
          startTime: toApiTime(form.startTime),
          endTime: toApiTime(form.endTime),
        },
      ],
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
    } catch (error) {
      console.error("Đã xảy ra lỗi khi đặt sân:", error);
      onError("Đã xảy ra lỗi khi đặt sân");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Derived submit guard
  // ---------------------------------------------------------------------------

  const canSubmit =
    !loadingCourts &&
    courts.length > 0 &&
    form.selectedSlots.length > 0 &&
    (form.customerMode === "guest"
      ? form.guestName.trim().length > 0
      : Boolean(form.customerId));

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Schedule section                                                     */}
      {/* ------------------------------------------------------------------ */}
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
            onChange={(e) =>
              updateForm({
                bookingDate: e.target.value,
                selectedSlots: [],
                startTime: "",
                endTime: "",
              })
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
                  if (val !== "all" && form.courtId) {
                    const court = courts.find((c) => c.id === form.courtId);
                    if (court && court.courtTypeId !== val) {
                      updateForm({
                        courtId: "",
                        selectedSlots: [],
                        startTime: "",
                        endTime: "",
                      });
                    }
                  }
                }}
              >
                <option value="all">Tất cả</option>
                {courtTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
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
              onSlotsChange={(slots) =>
                updateForm({
                  selectedSlots: slots,
                  startTime: slots.length > 0 ? slots[0].startTime : "",
                  endTime: slots.length > 0 ? slots[slots.length - 1].endTime : "",
                })
              }
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

      {/* ------------------------------------------------------------------ */}
      {/* Customer + Payment row                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid gap-4 lg:grid-cols-[1fr_0.75fr]">
        {/* Customer section */}
        <section className="rounded-xl border border-border bg-surface-1 p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Thông tin khách hàng
              </h2>
              <p className="text-sm font-medium text-muted">
                Khách vãng lai hoặc khách có tài khoản
              </p>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="mb-5">
            <ModeSwitch
              value={form.customerMode}
              onChange={handleModeChange}
            />
          </div>

          {/* Panes */}
          {form.customerMode === "guest" ? (
            <GuestPane
              form={form}
              errors={errors}
              updateForm={updateForm}
            />
          ) : (
            <CustomerPane
              form={form}
              errors={errors}
              updateForm={updateForm}
              selectedCustomer={selectedCustomer}
              setSelectedCustomer={setSelectedCustomer}
            />
          )}
        </section>

        {/* Payment aside */}
        <aside className="rounded-xl border border-border bg-surface-1 p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Thanh toán</h2>
              <p className="text-sm font-medium text-muted">
                Hình thức thanh toán
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Checkbox
              checked={form.payNow}
              onChange={(e) => updateForm({ payNow: e.target.checked })}
              label="Thanh toán ngay"
              description="Bỏ chọn nếu khách sẽ thanh toán sau"
            />

            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                Xác nhận
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {selectedCourt?.name ||
                  "Không có sân và khung giờ nào được chọn"}
              </p>
              <p className="mt-1 text-sm text-muted">
                {new Intl.DateTimeFormat("en-GB").format(
                  new Date(form.bookingDate),
                )}
                {form.startTime && form.endTime
                  ? ` · ${form.startTime} – ${form.endTime}`
                  : ""}
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Submit bar                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-1 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted">
          <CheckCircle className="h-5 w-5 text-primary" />
          Tạo đơn khi đã có lịch sân, thông tin khách hàng và thanh toán
        </div>
        <Button
          type="submit"
          isLoading={submitting}
          disabled={!canSubmit}
        >
          Tạo đơn đặt tại quầy
        </Button>
      </div>
    </form>
  );
}