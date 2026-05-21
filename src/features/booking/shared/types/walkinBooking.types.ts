// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
import { BookingDto } from "./booking.types";
import { TimeGridSlotDto } from "@/src/features/timeslot/types";
import { CustomerSearchDto, CustomerSearchQuery } from "@/src/features/customer/shared/types/customer.types";
export type CustomerMode = "guest" | "customer";

export type WalkInBookingFormState = {
    bookingDate: string;
    courtId: string;
    startTime: string;
    endTime: string;
    selectedSlots: TimeGridSlotDto[];
    customerMode: CustomerMode;
    customerId?: string | null;
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
    customerMode: "guest",
    customerId: null,
    guestName: "",
    guestPhone: "",
    guestEmail: "",
    note: "",
    payNow: true,
});

export interface WalkInBookingWorkspaceProps {
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

export interface ModeSwitchProps {
    value: CustomerMode;
    onChange: (mode: CustomerMode) => void;
}
export interface GuestPaneProps {
    form: WalkInBookingFormState;
    errors: FormErrors;
    updateForm: (patch: Partial<WalkInBookingFormState>) => void;
}
export interface CustomerPaneProps {
    form: WalkInBookingFormState;
    errors: FormErrors;
    updateForm: (patch: Partial<WalkInBookingFormState>) => void;
    selectedCustomer: CustomerSearchDto | null;
    setSelectedCustomer: (c: CustomerSearchDto | null) => void;
}

export type FormErrors = Partial<Record<keyof WalkInBookingFormState, string>>;
