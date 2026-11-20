import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addDaysToDateKey,
  formatDate,
  formatDateTime,
  getMinutesOfDayVN,
  getTodayVN,
  normalizeDateKey,
  parseBackendDate,
  parseBackendDateVN,
  toDateKeyVN,
} from "@/src/shared/utils/date";
import { atInstant, describeEachTimeZone } from "@/src/tests/clock";

// FE-12 (phần hàm giờ), P6-22, T-7, T-8, R-6.
describeEachTimeZone(() => {
  describe("getTodayVN — hôm nay theo giờ VN (T-7)", () => {
    const cases: Array<[string, string]> = [
      // [thời điểm thật (UTC), hôm nay ở VN]
      ["2026-11-20T17:30:00Z", "2026-11-21"], // 00:30 VN: toISOString() cũ ra 2026-11-20
      ["2026-11-20T23:59:00Z", "2026-11-21"], // 06:59 VN: mốc cuối của khoảng sai cũ
      ["2026-11-21T00:00:00Z", "2026-11-21"], // 07:00 VN
      ["2026-11-20T16:59:59Z", "2026-11-20"], // 23:59:59 VN
      ["2026-12-31T17:00:00Z", "2027-01-01"], // 00:00 VN ngày đầu năm
      ["2027-02-28T17:00:00Z", "2027-03-01"], // qua cuối tháng 2 năm thường
    ];
    for (const [instant, expected] of cases) {
      it(`lúc ${instant} là ${expected}`, () => {
        assert.equal(toDateKeyVN(new Date(instant)), expected);
        assert.equal(atInstant(instant, () => getTodayVN()), expected);
      });
    }
  });

  describe("getMinutesOfDayVN", () => {
    const cases: Array<[string, number]> = [
      ["2026-11-20T17:30:00Z", 30],
      ["2026-11-20T14:45:00Z", 21 * 60 + 45],
      ["2026-11-20T17:00:00Z", 0], // nửa đêm VN, không ra 24:00
      ["2026-11-20T16:59:00Z", 23 * 60 + 59],
    ];
    for (const [instant, minutes] of cases) {
      it(`lúc ${instant} là phút thứ ${minutes}`, () => {
        assert.equal(getMinutesOfDayVN(new Date(instant)), minutes);
      });
    }
  });

  describe("addDaysToDateKey — cộng trừ ngày trên lịch", () => {
    const cases: Array<[string, number, string]> = [
      ["2026-11-30", 1, "2026-12-01"],
      ["2026-12-31", 1, "2027-01-01"],
      ["2027-01-01", -1, "2026-12-31"],
      ["2027-02-28", 1, "2027-03-01"],
      ["2028-02-28", 1, "2028-02-29"], // năm nhuận
      ["2026-11-21", 0, "2026-11-21"],
    ];
    for (const [key, days, expected] of cases) {
      it(`${key} cộng ${days} ngày = ${expected}`, () => {
        assert.equal(addDaysToDateKey(key, days), expected);
      });
    }
  });

  describe("parseBackendDate / parseBackendDateVN — chuỗi giờ BE (T-8, R-6)", () => {
    it("đọc dd/MM/yyyy đúng ngày tháng, không đảo kiểu Mỹ", () => {
      const date = parseBackendDate("05/10/2026 07:00:00");
      assert.equal(date?.getDate(), 5);
      assert.equal(date?.getMonth(), 9); // tháng 10
      assert.equal(parseBackendDate("25/12/2026 21:30:15")?.getDate(), 25); // ngày > 12 trước đây ra Invalid Date
    });

    it("parseBackendDateVN đọc dd/MM/yyyy HH:mm:ss là giờ VN (+07:00)", () => {
      assert.equal(parseBackendDateVN("05/10/2026 07:00:00")?.toISOString(), "2026-10-05T00:00:00.000Z");
      assert.equal(parseBackendDateVN("01/01/2027 00:30:00")?.toISOString(), "2026-12-31T17:30:00.000Z");
    });

    it("parseBackendDateVN đọc ISO không kèm múi giờ của dashboard là giờ VN", () => {
      assert.equal(parseBackendDateVN("2026-11-20T21:30:00")?.toISOString(), "2026-11-20T14:30:00.000Z");
    });

    it("parseBackendDateVN giữ nguyên ISO có múi giờ (payload SignalR)", () => {
      assert.equal(parseBackendDateVN("2026-11-20T14:30:00Z")?.toISOString(), "2026-11-20T14:30:00.000Z");
      assert.equal(parseBackendDateVN("2026-11-20T21:30:00+07:00")?.toISOString(), "2026-11-20T14:30:00.000Z");
    });

    it("chuỗi hỏng trả null", () => {
      assert.equal(parseBackendDate("không phải ngày"), null);
      assert.equal(parseBackendDateVN("không phải ngày"), null);
    });
  });

  describe("formatDate / formatDateTime — hiện lại đúng giá trị BE trả", () => {
    it("ngày đặt sân 'dd/MM/yyyy 07:00:00' của BE hiện đúng ngày", () => {
      assert.equal(formatDate("30/11/2026 07:00:00"), "30/11/2026");
      assert.equal(formatDate("05/10/2026 07:00:00"), "05/10/2026");
    });

    it("mốc thời gian dd/MM/yyyy HH:mm:ss hiện đúng giờ phút", () => {
      assert.equal(formatDateTime("20/11/2026 21:31:42"), "20/11/2026 21:31");
    });
  });

  describe("normalizeDateKey — khóa nhóm realtime của lưới giờ", () => {
    it("giữ nguyên khóa ngày FE (new Date(khóa) lùi một ngày ở UTC−x)", () => {
      assert.equal(normalizeDateKey("2026-12-01"), "2026-12-01");
    });

    it("đổi chuỗi dd/MM/yyyy của BE về khóa ngày", () => {
      assert.equal(normalizeDateKey("05/10/2026 07:00:00"), "2026-10-05");
    });
  });

  describe("hợp đồng request FE ⇒ BE (BookingDateTimeRoundTripTests của BE gửi đúng chuỗi này)", () => {
    it("bookingDate của đặt online = new Date(khóa ngày).toISOString() luôn là nửa đêm UTC của chính ngày đó", () => {
      for (const key of ["2026-11-21", "2026-11-30", "2026-12-31", "2027-01-01"]) {
        assert.equal(new Date(key).toISOString(), `${key}T00:00:00.000Z`);
      }
    });
  });
});
