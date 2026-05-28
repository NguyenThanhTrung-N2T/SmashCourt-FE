export interface ReportFilterDto {
    fromDate?: string; // format YYYY-MM-DD
    toDate?: string;   // format YYYY-MM-DD
    branchId?: string; // Guid
    groupBy?: 'day' | 'week' | 'month' | 'branch' | 'courtType' | 'paymentMethod' | 'hour' | 'dayOfWeek';
}

export interface DashboardSummaryDto {
    totalRevenue: number;
    revenueChangePercent: number;
    totalBookings: number;
    bookingChangePercent: number;
    completedBookings: number;
    cancelledBookings: number;
    noShowBookings: number;
    newCustomers: number;
    newCustomerChangePercent: number;
    occupancyRate: number;
    occupancyChangePercent: number;
    onlinePaymentRevenue: number;
    cashPaymentRevenue: number;
}

export interface TopBranchDto {
    branchId: string;
    branchName: string;
    revenue: number;
    bookingCount: number;
}

export interface TopCustomerDto {
    customerId: string;
    fullName: string;
    totalRevenue: number;
    bookingCount: number;
    loyaltyTier: string;
}

export interface RevenueTrendDto {
    period: string;
    revenue: number;
    bookingCount: number;
}

export interface BookingTrendDto {
    period: string;
    totalCount: number;
    completedCount: number;
}

export interface OwnerDashboardDto {
    summary: DashboardSummaryDto;
    topBranches: TopBranchDto[];
    topCustomers: TopCustomerDto[];
    revenueTrend: RevenueTrendDto[];
    bookingTrend: BookingTrendDto[];
}

export interface ManagerDashboardDto {
    summary: DashboardSummaryDto;
    topCustomers: TopCustomerDto[];
    revenueTrend: RevenueTrendDto[];
    bookingTrend: BookingTrendDto[];
}

export interface RevenueItemDto {
    period: string;
    revenue: number;
    bookingCount: number;
}

export interface RevenueReportDto {
    totalRevenue: number;
    courtRevenue: number;
    serviceRevenue: number;
    discountAmount: number;
    averageBookingValue: number;
    items: RevenueItemDto[];
}

export interface BookingItemDto {
    period: string;
    bookingCount: number;
    completedCount: number;
    cancelledCount: number;
}

export interface BookingReportDto {
    totalBookings: number;
    completed: number;
    cancelled: number;
    noShow: number;
    pendingPayment: number;
    onlineBookings: number;
    walkInBookings: number;
    cancellationRate: number;
    noShowRate: number;
    items: BookingItemDto[];
}

export interface PeakHourDto {
    hour: number;
    bookingCount: number;
    occupancyRate: number;
}

export interface CourtUtilizationItemDto {
    courtId: string;
    courtName: string;
    period: string;
    bookedHours: number;
    availableHours: number;
    occupancyRate: number;
}

export interface CourtUtilizationReportDto {
    overallOccupancyRate: number;
    totalAvailableHours: number;
    totalBookedHours: number;
    peakHours: PeakHourDto[];
    offPeakHours: PeakHourDto[];
    topCourts: CourtUtilizationItemDto[];
    items: CourtUtilizationItemDto[];
}

export interface LoyaltyTierDistributionDto {
    tierName: string;
    customerCount: number;
    percentage: number;
}

export interface CustomerAcquisitionTrendDto {
    period: string;
    newCustomers: number;
}

export interface CustomerStatisticsReportDto {
    totalCustomers: number;
    newCustomers: number;
    repeatCustomers: number;
    repeatCustomerRate: number;
    averageBookingsPerCustomer: number;
    averageRevenuePerCustomer: number;
    loyaltyTierDistribution: LoyaltyTierDistributionDto[];
    acquisitionTrend: CustomerAcquisitionTrendDto[];
}

export interface TopSpenderDto {
    customerId: string;
    fullName: string;
    email: string;
    phone: string;
    totalRevenue: number;
    bookingCount: number;
    loyaltyTier: string;
}

export interface TopSpendersReportDto {
    totalCount: number;
    page: number;
    pageSize: number;
    items: TopSpenderDto[];
}

export interface ServiceItemDto {
    serviceId: string;
    serviceName: string;
    revenue: number;
    bookingCount: number;
    averageRevenue: number;
}

export interface ServiceTrendDto {
    period: string;
    serviceRevenue: number;
    bookingCount: number;
}

export interface ServicePerformanceReportDto {
    totalServiceRevenue: number;
    totalBookingsWithServices: number;
    serviceAttachmentRate: number;
    averageServiceRevenuePerBooking: number;
    topServices: ServiceItemDto[];
    serviceTrend: ServiceTrendDto[];
}

export interface PromotionItemDto {
    promotionId: string;
    promotionName: string;
    promotionCode: string;
    usageCount: number;
    totalDiscount: number;
    revenueAfterDiscount: number;
    averageDiscount: number;
}

export interface PromotionTrendDto {
    period: string;
    usageCount: number;
    totalDiscount: number;
}

export interface PromotionEffectivenessReportDto {
    totalDiscountAmount: number;
    totalPromotionUsage: number;
    averageDiscountPerUsage: number;
    promotionConversionRate: number;
    topPromotions: PromotionItemDto[];
    promotionTrend: PromotionTrendDto[];
}
