import assert from "node:assert/strict";
import { it } from "node:test";
import { formatDate, formatDateISO, formatDateTime } from "@/src/shared/utils/dateFormatter";
import { describeEachTimeZone } from "@/src/tests/clock";

// T-8: ô chọn khuyến mãi hiện startDate / endDate BE trả "dd/MM/yyyy HH:mm:ss"; trước đây new Date() đọc kiểu Mỹ (05/10 ⇒ 10/05).
describeEachTimeZone(() => {
  it("formatDate không đảo ngày tháng", () => {
    assert.equal(formatDate("05/10/2026 00:00:00"), "05/10/2026");
    assert.equal(formatDate("25/12/2026 23:59:59"), "25/12/2026");
  });

  it("formatDateISO ra khóa ngày của chính ngày đó, không qua UTC", () => {
    assert.equal(formatDateISO("05/10/2026 00:00:00"), "2026-10-05");
    assert.equal(formatDateISO("2026-12-31"), "2026-12-31");
  });

  it("formatDateTime giữ đúng giờ phút BE trả", () => {
    assert.match(formatDateTime("05/10/2026 21:30:00"), /05\/10\/2026/);
    assert.match(formatDateTime("05/10/2026 21:30:00"), /21:30/);
  });

  it("thiếu giá trị", () => {
    assert.equal(formatDate(null), "N/A");
    assert.equal(formatDateISO(undefined), "");
  });
}, ["Asia/Ho_Chi_Minh", "UTC", "America/New_York"]);
