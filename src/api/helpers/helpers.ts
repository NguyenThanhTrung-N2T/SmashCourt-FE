// ============================================================================
// Helpers
// ============================================================================

export function buildQuery(params: Record<string, string | undefined>): string {
    const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
    if (entries.length === 0) return "";
    return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(v!)}`).join("&");
}