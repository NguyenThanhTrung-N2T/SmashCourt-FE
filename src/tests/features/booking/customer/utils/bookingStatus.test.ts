import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateHoursUntil, canCancelBooking } from "@/src/features/booking/customer/utils/bookingStatus";
import { atInstant, describeEachTimeZone } from "@/src/tests/clock";

// P6-23, T-4, bẫy 17: giờ chơi = phần ngày của bookingDate BE trả ("dd/MM/yyyy 07:00:00", phần giờ vô nghĩa) + startTime,
// tính là giờ VN, không theo múi giờ máy. Chuỗi đúng dạng BE trả (BookingDateTimeRoundTripTests của BE khóa dạng này).
const BOOKING_DATE = "30/11/2026 07:00:00"; // đơn chơi 21:00 ngày 30/11/2026 giờ VN = 14:00Z

const close = (actual: number, expected: number) =>
  assert.ok(Math.abs(actual - expected) < 1e-6, `được ${actual}, cần ${expected}`);

describeEachTimeZone(() => {
  describe("calculateHoursUntil", () => {
    const cases: Array<[string, number]> = [
      ["2026-11-30T12:00:00Z", 2], // 19:00 VN
      ["2026-11-29T14:00:00Z", 24],
      ["2026-11-30T14:00:00Z", 0],
      ["2026-11-30T15:30:00Z", -1.5],
    ];
    for (const [now, hours] of cases) {
      it(`lúc ${now} còn ${hours} giờ`, () => {
        close(atInstant(now, () => calculateHoursUntil(BOOKING_DATE, "21:00:00")), hours);
      });
    }

    it("không lấy 07:00:00 của bookingDate làm giờ chơi", () => {
      // 08:00 VN: đã qua 07:00 nhưng còn 13 giờ tới 21:00
      close(atInstant("2026-11-30T01:00:00Z", () => calculateHoursUntil(BOOKING_DATE, "21:00:00")), 13);
    });

    it("nhận cả khóa ngày yyyy-MM-dd", () => {
      close(atInstant("2026-11-30T12:00:00Z", () => calculateHoursUntil("2026-11-30", "21:00:00")), 2);
    });

    it("chuỗi hỏng trả 0 (coi như đã tới giờ, ẩn nút hủy)", () => {
      assert.equal(calculateHoursUntil("không phải ngày", "21:00:00"), 0);
    });
  });

  describe("canCancelBooking — khách tự hủy trước giờ bắt đầu", () => {
    for (const status of ["PENDING", "PENDING_APPROVAL", "CONFIRMED", "PAID_ONLINE"]) {
      it(`${status} hủy được khi chưa tới giờ`, () => {
        // 20:59 VN
        assert.equal(atInstant("2026-11-30T13:59:00Z", () => canCancelBooking(status, BOOKING_DATE, "21:00:00")), true);
      });
    }

    for (const now of ["2026-11-30T14:00:00Z", "2026-11-30T14:01:00Z"]) {
      it(`đúng giờ bắt đầu hoặc sau đó (${now}) thì không hủy được`, () => {
        assert.equal(atInstant(now, () => canCancelBooking("PAID_ONLINE", BOOKING_DATE, "21:00:00")), false);
      });
    }

    for (const status of ["IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]) {
      it(`${status} không hủy được`, () => {
        assert.equal(atInstant("2026-11-29T00:00:00Z", () => canCancelBooking(status, BOOKING_DATE, "21:00:00")), false);
      });
    }
  });
});
