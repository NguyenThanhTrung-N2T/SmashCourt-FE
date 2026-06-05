import { authFetch, authProtectedFetch } from "./core";
import {
    ChatRequestDto,
    ChatResponseDto,
    FaqItemDto,
    BookingSuggestionRequestDto,
    BookingSuggestionResponseDto,
    PricingSuggestionRequestDto,
    PricingSuggestionResponseDto,
    PromotionSuggestionRequestDto,
    PromotionSuggestionResponseDto,
    AnalyticsSummaryRequestDto,
    AnalyticsSummaryResponseDto,
    StrategicSuggestionRequestDto,
    StrategicSuggestionResponseDto,
} from "../features/ai/shared/ai.types";

const BASE_PATH = "/api/AI";

/**
 * 1. Public Chat - Send a message to the AI assistant
 */
export async function sendPublicChat(
    body: ChatRequestDto
): Promise<ChatResponseDto> {
    const response = await authFetch<ChatResponseDto>(`${BASE_PATH}/chat`, {
        method: "POST",
        body,
    });
    if (!response.data) throw new Error("Failed to send chat message");
    return response.data;
}

/**
 * 1. Public FAQ - Fetch frequently asked questions
 */
export async function fetchAiFaqs(): Promise<FaqItemDto[]> {
    const response = await authFetch<FaqItemDto[]>(`${BASE_PATH}/chat/faq`, {
        method: "GET",
    });
    if (!response.data) throw new Error("Failed to fetch FAQs");
    return response.data;
}

/**
 * 2. Booking Suggestion (Customer)
 */
export async function getBookingSuggestions(
    body: BookingSuggestionRequestDto = {}
): Promise<BookingSuggestionResponseDto> {
    const response = await authProtectedFetch<BookingSuggestionResponseDto>(
        `${BASE_PATH}/suggest/booking`,
        {
            method: "POST",
            body,
        }
    );
    if (!response.data) throw new Error("Failed to get booking suggestions");
    return response.data;
}

/**
 * 3. Pricing Suggestion (Manager / Owner)
 */
export async function getPricingSuggestions(
    body: PricingSuggestionRequestDto
): Promise<PricingSuggestionResponseDto> {
    const response = await authProtectedFetch<PricingSuggestionResponseDto>(
        `${BASE_PATH}/suggest/pricing`,
        {
            method: "POST",
            body,
        }
    );
    if (!response.data) throw new Error("Failed to get pricing suggestions");
    return response.data;
}

/**
 * 4. Promotion Suggestion (Manager / Owner)
 */
export async function getPromotionSuggestions(
    body: PromotionSuggestionRequestDto
): Promise<PromotionSuggestionResponseDto> {
    const response = await authProtectedFetch<PromotionSuggestionResponseDto>(
        `${BASE_PATH}/suggest/promotions`,
        {
            method: "POST",
            body,
        }
    );
    if (!response.data) throw new Error("Failed to get promotion suggestions");
    return response.data;
}

/**
 * 5. Analytics Summary (Manager / Owner)
 */
export async function getAnalyticsSummary(
    body: AnalyticsSummaryRequestDto
): Promise<AnalyticsSummaryResponseDto> {
    const response = await authProtectedFetch<AnalyticsSummaryResponseDto>(
        `${BASE_PATH}/analytics/summary`,
        {
            method: "POST",
            body,
        }
    );
    if (!response.data) throw new Error("Failed to get analytics summary");
    return response.data;
}

/**
 * 6. Strategic Suggestions (Owner Only)
 */
export async function getStrategicSuggestions(
    body: StrategicSuggestionRequestDto
): Promise<StrategicSuggestionResponseDto> {
    const response = await authProtectedFetch<StrategicSuggestionResponseDto>(
        `${BASE_PATH}/analytics/strategic`,
        {
            method: "POST",
            body,
        }
    );
    if (!response.data) throw new Error("Failed to get strategic suggestions");
    return response.data;
}
