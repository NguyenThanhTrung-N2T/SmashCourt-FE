"use client";

import { CourtManagementBase } from "../shared/components/CourtManagementBase";

export function CourtManagementPage() {
    return <CourtManagementBase allowManagement={false} bookingPath="/staff/bookings" />;
}
