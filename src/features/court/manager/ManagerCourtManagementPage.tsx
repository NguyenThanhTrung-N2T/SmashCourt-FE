"use client";

import { CourtManagementBase } from "../shared/components/CourtManagementBase";

export function ManagerCourtManagementPage() {
    return <CourtManagementBase allowManagement={true} bookingPath="/manager/bookings" />;
}
