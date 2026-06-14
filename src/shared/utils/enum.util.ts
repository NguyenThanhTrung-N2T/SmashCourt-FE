// ─────────────────────────────────────────────
// Generic enum utilities for `as const` maps
//
// Usage:
//   import { enumToValue, enumToKey, isValidKey } from "@/utils/enum.util";
// ─────────────────────────────────────────────

export type EnumMap = Record<string, number>;

/** All string keys of an `as const` map */
export type EnumKey<T extends EnumMap> = keyof T & string;

/** All numeric values of an `as const` map */
export type EnumValue<T extends EnumMap> = T[EnumKey<T>];

/**
 * String key → numeric value.
 * Returns `undefined` for unknown keys — never throws.
 *
 * @example
 *   enumToValue(BookingStatus, "IN_PROGRESS")  // → 3
 *   enumToValue(BookingStatus, "UNKNOWN")       // → undefined
 */
export function enumToValue<T extends EnumMap>(
    map: T,
    key: string | null | undefined,
): EnumValue<T> | undefined {
    if (key == null || !(key in map)) return undefined;
    return map[key as EnumKey<T>] as EnumValue<T>;
}

/**
 * Numeric value → string key.
 * Returns `undefined` for unknown values — never throws.
 *
 * @example
 *   enumToKey(BookingStatus, 3)   // → "IN_PROGRESS"
 *   enumToKey(BookingStatus, 99)  // → undefined
 */
export function enumToKey<T extends EnumMap>(
    map: T,
    value: number | null | undefined,
): EnumKey<T> | undefined {
    if (value == null) return undefined;
    return (Object.keys(map) as EnumKey<T>[]).find((k) => map[k] === value);
}

/**
 * Type guard — narrows an unknown value to a valid key of the map.
 * Use this when receiving raw data from the API.
 *
 * @example
 *   if (isValidKey(BookingStatus, raw.status)) {
 *     // raw.status is now EnumKey<typeof BookingStatus> ✓
 *   }
 */
export function isValidKey<T extends EnumMap>(
    map: T,
    key: unknown,
): key is EnumKey<T> {
    return typeof key === "string" && key in map;
}

/**
 * Type guard — narrows an unknown value to a valid numeric value of the map.
 *
 * @example
 *   if (isValidValue(BookingStatus, raw.status)) {
 *     // raw.status is now EnumValue<typeof BookingStatus> ✓
 *   }
 */
export function isValidValue<T extends EnumMap>(
    map: T,
    value: unknown,
): value is EnumValue<T> {
    return typeof value === "number" && Object.values(map).includes(value);
}