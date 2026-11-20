import { afterEach, beforeEach, describe } from "node:test";

// Kết quả ngày giờ không được phụ thuộc múi giờ máy người dùng: chạy lại mỗi ca dưới VN, UTC, UTC−5, UTC+14
// (Node đọc lại process.env.TZ ở mỗi phép tính Date).
export const MACHINE_TIME_ZONES = ["Asia/Ho_Chi_Minh", "UTC", "America/New_York", "Pacific/Kiritimati"];

export function describeEachTimeZone(body: () => void, zones: string[] = MACHINE_TIME_ZONES): void {
  for (const zone of zones) {
    describe(`máy ở múi giờ ${zone}`, () => {
      const original = process.env.TZ;
      beforeEach(() => {
        process.env.TZ = zone;
      });
      afterEach(() => {
        process.env.TZ = original;
      });
      body();
    });
  }
}

/** Chạy fn với "bây giờ" cố định: new Date() không tham số và Date.now() trả mốc đã cho; mọi cách tạo Date khác giữ nguyên. */
export function atInstant<T>(iso: string, fn: () => T): T {
  const RealDate = Date;
  const fixed = new RealDate(iso).getTime();
  class FixedDate extends RealDate {
    constructor(...args: unknown[]) {
      if (args.length === 0) super(fixed);
      else super(...(args as [number, number, number, number, number, number, number]));
    }
    static now(): number {
      return fixed;
    }
  }
  globalThis.Date = FixedDate as DateConstructor;
  try {
    return fn();
  } finally {
    globalThis.Date = RealDate;
  }
}
