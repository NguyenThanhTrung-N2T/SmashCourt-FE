export type GeneratedAt = string; // ISO 8601 datetime string
export type DateString = string; // "YYYY-MM-DD"

// --- 1. Public Chat ---

export interface ChatRequestDto {
    message: string;      // 1-2000 chars
    sessionId?: string;   // Optional, for conversation context
}

export interface ChatResponseDto {
    reply: string;
    suggestions: string[];
    model: string;
    sessionId: string;
    generatedAt: GeneratedAt;
}

export interface FaqItemDto {
    question: string;
    answer: string;
    category: string;
}

// --- 2. Booking Suggestion (Customer) ---

export interface BookingSuggestionRequestDto {
    branchId?: string;
    date?: DateString;
    courtType?: string;
}

export interface BookingSlotMetadata {
    startTime: string;
    endTime: string;
}

export interface BookingSuggestionDto {
    type: "time_slot" | "branch" | "court_type" | "general" | "promotion";
    title: string;
    description: string;
    action: string;
    metadata?: BookingSlotMetadata;
}

export interface BookingSuggestionResponseDto {
    suggestions: BookingSuggestionDto[];
    model: string;
    generatedAt: GeneratedAt;
}

// --- 3. Pricing Suggestion (Manager / Owner) ---

export interface PricingSuggestionRequestDto {
    branchId?: string; // Optional for OWNER, ignored for BRANCH_MANAGER
    fromDate: DateString;
    toDate: DateString;
}

export interface PricingSuggestionDto {
    timeSlot: string;
    dayOfWeek: string;
    currentPrice: number;
    suggestedIncreasePercent: number; // [-20, +30]
    suggestedPrice: number;
    reasoning: string;
    confidence: number; // [0, 1]
}

export interface PricingSuggestionResponseDto {
    suggestions: PricingSuggestionDto[];
    model: string;
    generatedAt: GeneratedAt;
    success: boolean;
    message: string | null;
}

// --- 4. Promotion Suggestion (Manager / Owner) ---

export interface PromotionSuggestionRequestDto {
    branchId?: string;
    fromDate: DateString;
    toDate: DateString;
}

export interface PromotionSuggestionDto {
    timeSlot: string;
    dayOfWeek: string;
    currentOccupancyPercent: number;
    discountPercent: number; // [10, 50]
    targetSegment: string;
    suggestedDurationDays: number;
    estimatedRevenueImpact: number;
    reasoning: string;
}

export interface PromotionSuggestionResponseDto {
    branchId: string;
    suggestions: PromotionSuggestionDto[];
    model: string;
    generatedAt: GeneratedAt;
}

// --- 5. Analytics Summary (Manager / Owner) ---

export interface AnalyticsSummaryRequestDto {
    branchId?: string;
    fromDate: DateString;
    toDate: DateString;
}

export interface AnalyticsSummaryResponseDto {
    branchId: string;
    branchName: string;
    period: string;
    overview: string;
    highlights: string[];
    concerns: string[];
    recommendations: string[];
    model: string;
    generatedAt: GeneratedAt;
}

// --- 6. Strategic Suggestions (Owner Only) ---

export interface StrategicSuggestionRequestDto {
    fromDate: DateString;
    toDate: DateString;
}

export interface BranchPerformanceDto {
    branchId: string;
    branchName: string;
    performanceRating: "Excellent" | "Good" | "Needs Improvement";
    strengths: string[];
    weaknesses: string[];
}

export interface StaffingSuggestionDto {
    branchId: string;
    branchName: string;
    suggestion: string;
    reasoning: string;
}

export interface ExpansionOpportunityDto {
    location: string;
    opportunity: string;
    reasoning: string;
    priority: number; // [0, 1]
}

export interface StrategicSuggestionResponseDto {
    branchPerformance: BranchPerformanceDto[];
    staffingSuggestions: StaffingSuggestionDto[];
    expansionOpportunities: ExpansionOpportunityDto[];
    demandForecast: {
        summary: string;
        predictions: string[];
    } | null;
    model: string;
    generatedAt: GeneratedAt;
}
