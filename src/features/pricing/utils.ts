import type { CourtType, CurrentPriceDto, EffectivePriceDto, PriceConfig, PriceRow, TimeSlot } from "./types";

export function fmt(n: number): string {
    return n.toLocaleString("vi-VN") + "đ";
}

export function fmtDate(d: string): string {
    const datePart = normalizeDateString(d);
    const [y, m, day] = datePart.split("-");
    return `${day}/${m}/${y}`;
}

export function todayStr(): string {
    return new Date().toISOString().slice(0, 10);
}

export function normalizeDateString(dateStr: string): string {
    if (!dateStr) return "";
    
    if (dateStr.includes("T")) {
        return dateStr.split("T")[0];
    }
    
    if (dateStr.includes(" ")) {
        const parts = dateStr.split(" ");
        if (parts.length >= 3 && parts[2].length === 4) {
             return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        if (parts[0].includes("-") && parts[0].length === 10) {
             return parts[0];
        }
    }
    
    if (dateStr.includes("/")) {
        const parts = dateStr.split(" ")[0].split("/");
        if (parts.length === 3 && parts[2].length === 4) {
             return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
    }
    
    return dateStr.split(" ")[0];
}

/**
 * Transform full history API data into internal PriceConfig format.
 * Groups by courtTypeId + effectiveFrom — used for version history dropdown.
 */
export function transformApiData(
    prices: CurrentPriceDto[],
): { courtTypes: CourtType[]; timeSlots: TimeSlot[]; configs: PriceConfig[] } {
    const courtTypeMap = new Map<string, string>();
    prices.forEach((p) => {
        courtTypeMap.set(p.courtTypeId, p.courtTypeName);
    });
    const courtTypes: CourtType[] = Array.from(courtTypeMap).map(([id, name]) => ({
        id,
        name,
    }));

    const timeSlotMap = new Map<string, TimeSlot>();
    prices.forEach((p) => {
        const key = `${p.startTime}|${p.endTime}`;
        if (!timeSlotMap.has(key)) {
            timeSlotMap.set(key, {
                id: key,
                label: `${p.startTime.slice(0, 5)} – ${p.endTime.slice(0, 5)}`,
                startTime: p.startTime,
                endTime: p.endTime,
            });
        }
    });
    const timeSlots: TimeSlot[] = Array.from(timeSlotMap.values()).sort((a, b) =>
        a.startTime.localeCompare(b.startTime),
    );

    const configMap = new Map<string, PriceConfig>();
    prices.forEach((p) => {
        const normalizedDate = normalizeDateString(p.effectiveFrom);
        const configKey = `${p.courtTypeId}|${normalizedDate}`;
        if (!configMap.has(configKey)) {
            configMap.set(configKey, {
                id: configKey,
                courtTypeId: p.courtTypeId,
                courtTypeName: p.courtTypeName,
                effectiveFrom: normalizedDate,
                rows: [],
            });
        }
        const config = configMap.get(configKey)!;
        config.rows.push({
            slotId: `${p.startTime}|${p.endTime}`,
            slotLabel: `${p.startTime.slice(0, 5)} – ${p.endTime.slice(0, 5)}`,
            startTime: p.startTime,
            endTime: p.endTime,
            weekdayPrice: p.weekdayPrice,
            weekendPrice: p.weekendPrice,
        });
    });

    const configs: PriceConfig[] = Array.from(configMap.values()).sort((a, b) => {
        if (a.courtTypeId !== b.courtTypeId) {
            return a.courtTypeId.localeCompare(b.courtTypeId);
        }
        return b.effectiveFrom.localeCompare(a.effectiveFrom);
    });

    return { courtTypes, timeSlots, configs };
}

/**
 * Transform current system prices from /system-prices/current.
 * Groups by courtTypeId ONLY (not by date) — the backend already resolved
 * the latest-per-slot, so we just need one flat config per court type.
 * effectiveFrom is set to the most recent date among all rows.
 *
 * Returns a Map<courtTypeId, PriceConfig> for O(1) lookup.
 */
export function transformCurrentApiData(
    prices: CurrentPriceDto[],
): Map<string, PriceConfig> {
    const configMap = new Map<string, PriceConfig>();

    prices.forEach((p) => {
        const normalizedDate = normalizeDateString(p.effectiveFrom);
        if (!configMap.has(p.courtTypeId)) {
            configMap.set(p.courtTypeId, {
                id: p.courtTypeId,
                courtTypeId: p.courtTypeId,
                courtTypeName: p.courtTypeName,
                effectiveFrom: normalizedDate,
                rows: [],
            });
        }

        const config = configMap.get(p.courtTypeId)!;

        // Track the most recent effectiveFrom as the version label
        if (normalizedDate > config.effectiveFrom) {
            config.effectiveFrom = normalizedDate;
        }

        config.rows.push({
            slotId: `${p.startTime}|${p.endTime}`,
            slotLabel: `${p.startTime.slice(0, 5)} – ${p.endTime.slice(0, 5)}`,
            startTime: p.startTime,
            endTime: p.endTime,
            weekdayPrice: p.weekdayPrice,
            weekendPrice: p.weekendPrice,
        });
    });

    // Sort each config's rows chronologically
    configMap.forEach((config) => {
        config.rows.sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return configMap;
}

export function getCurrentConfig(configs: PriceConfig[], courtTypeId: string): PriceConfig | null {
    const courtsConfigs = configs.filter(
        (c) => c.courtTypeId === courtTypeId && c.effectiveFrom <= todayStr(),
    );
    return courtsConfigs.sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0] ?? null;
}

export function getHistory(configs: PriceConfig[], courtTypeId: string): PriceConfig[] {
    return configs
        .filter((c) => c.courtTypeId === courtTypeId)
        .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
}

/**
 * Transform EffectivePriceDto[] (from GET /branches/{id}/prices/current) into
 * a map of court-type → single PriceConfig with ALL time slots and priceSource
 * attached to each row.
 */
export function transformEffectiveData(
    prices: EffectivePriceDto[],
): { courtTypes: CourtType[]; configs: Map<string, PriceConfig> } {
    const courtTypeMap = new Map<string, string>();
    prices.forEach((p) => courtTypeMap.set(p.courtTypeId, p.courtTypeName));

    const courtTypes: CourtType[] = Array.from(courtTypeMap).map(([id, name]) => ({ id, name }));

    const configMap = new Map<string, PriceConfig>();
    prices.forEach((p) => {
        const normalizedDate = normalizeDateString(p.effectiveFrom);
        if (!configMap.has(p.courtTypeId)) {
            configMap.set(p.courtTypeId, {
                id: p.courtTypeId,
                courtTypeId: p.courtTypeId,
                courtTypeName: p.courtTypeName,
                effectiveFrom: normalizedDate,
                rows: [],
            });
        }
        const config = configMap.get(p.courtTypeId)!;
        const row: PriceRow = {
            slotId: `${p.startTime}|${p.endTime}`,
            slotLabel: `${p.startTime.slice(0, 5)} – ${p.endTime.slice(0, 5)}`,
            startTime: p.startTime,
            endTime: p.endTime,
            weekdayPrice: p.weekdayPrice,
            weekendPrice: p.weekendPrice,
            priceSource: p.priceSource,
        };
        config.rows.push(row);
    });

    configMap.forEach((config) => {
        config.rows.sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return { courtTypes, configs: configMap };
}
