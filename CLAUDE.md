# smashcourt-fe — Frontend Web

Next.js 16 (App Router) + React 19 + TypeScript strict + Tailwind CSS v4. Giao diện cho 4 role của SmashCourt. Thuộc workspace 4 repo — xem `../CLAUDE.md`.

## Lệnh
```bash
npm ci
npm run dev                         # http://localhost:3000
npx tsc --noEmit -p .               # type-check nhanh (~25s)
npx eslint <file...>                # lint file đã sửa
npm run lint                        # = CI
npm test                            # = CI, node:test (không thêm gói): unit test hàm thuần src/tests/**/*.test.ts, ngày giờ chạy dưới 4 múi giờ máy
npm run build                       # = CI, kiểm chứng bundle production
```
CI (`.github/workflows/ci.yml`, Node 20): `npm ci` → `npm run lint` → `npx tsc --noEmit -p .` → `npm test` → `npm run build`. Push `master` mà CI đạt ⇒ job `deploy-production` triển khai Vercel production (Vercel CLI ghim `65.9.0`, `vercel pull/build/deploy --prebuilt`; cần Environment `production` có `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`; tắt tự triển khai theo Git trong Vercel). `develop` chỉ chạy CI. Test tự động: unit test `node:test` cho hàm thuần (bộ chạy `src/tests/run.mjs`, hook `src/tests/ts-hooks.mjs` dịch TS bằng `typescript` sẵn có, đọc alias `@/`) (FE-12, từ 21/11, thư mục riêng `src/tests/`, cây bên trong phản chiếu `src/`: `shared/utils/date*.test.ts`, `features/booking/customer/utils/bookingStatus.test.ts`); chưa có MSW, Playwright.

## Kiến trúc (chi tiết: skill `smashcourt-fe-architecture`)
```
app/                       → routing MỎNG: page.tsx chỉ render component từ src/features
  (customer)/  owner/  manager/  staff/     → mỗi nhóm có layout.tsx bọc <RoleGuard allowedRole="..."> + layout sidebar/topnav
    (customer)/bookings/new, (customer)/payment → đặt sân online (bắt buộc đăng nhập) và trang kết quả VNPay
  auth/  booking/cancel/  cancellation-policy/ → trang công khai (đăng nhập/đăng ký…, hủy bằng link email, chính sách hủy)
  employee/                                 → thư mục rỗng (không có page), không dùng
src/api/{feature}.api.ts   → hàm gọi BE qua authProtectedFetch/authFetch (src/api/core); JSDoc "METHOD /api/route"
src/features/{feature}/{customer|owner|manager|staff|shared}/
    components/ (states/, modals/)  dialogs/  hooks/useX.ts  utils/  types/{feature}.types.ts  {Role}{Feature}Page.tsx
src/shared/components/{ui,feedback,layout}  → Button, Input, Modal, Select, Pagination, ConfirmationDialog, Skeleton, EmptyState... (barrel index.ts)
src/shared/{hooks,utils,types}              → useToast, useDebounceSearch, cn(), date utils, api.types...
src/layouts/{role}/        → sidebar/topnav + navigation config theo role
src/contexts/              → Theme, Toast, SignalR, Notification, RealtimeProviders
src/lib/                   → signalr-client.ts, signalr-events.ts (khớp SignalREvents.cs của BE)
src/tests/                 → unit test node:test, cây bên trong phản chiếu src/ (không đặt test cạnh mã nguồn); run.mjs + ts-hooks.mjs + clock.ts (đổi múi giờ máy, cố định "bây giờ")
```
Role: `CUSTOMER` → `app/(customer)`, `OWNER` → `app/owner`, `BRANCH_MANAGER` → `app/manager`, `STAFF` → `app/staff`.

## Điểm cần nhớ
- Import tuyệt đối `@/src/...`. Component có state/hook ⇒ `"use client";`.
- Chỉ gọi BE qua `src/api/*`; BE trả `{ success, code, message, data, errors }`, lỗi ném `AuthApiError` — xử lý theo `code`.
- FE không gọi trực tiếp SmashCourt-AI / VNPay / Cloudinary.
- Tái sử dụng `src/shared/components` trước khi tạo UI mới. Icon: `@phosphor-icons/react`. Biểu đồ: `recharts`. Ngày giờ: `date-fns`.
- Env: một biến duy nhất `NEXT_PUBLIC_API_BASE_URL` (địa chỉ gốc BE, không có `/api`), dùng cho REST và SignalR hub (`toUrl`); `NEXT_PUBLIC_API_URL` đã bỏ (31/10). Không đọc/sửa `.env` (được sửa `.env.example`).
- Type phải khớp DTO của BE (camelCase); BE đổi contract thì sửa types + api tương ứng.
- **Phase 6 (Epic 6B, đang làm; việc còn lại V1…V14 ở `PHASE6_FE_HANDOFF.md` Mục 4, đã xong ở Mục 5, dựng lại 23/11):** hiển thị cọc, trạng thái chờ duyệt, hàng chờ duyệt cho Manager, lý do hủy, thanh toán cọc/thanh toán lại. Thiết kế FE ở `../TADSS-Runtime/spec/PHASE6_DESIGN_SPEC.md` Mục 8; contract BE ↔ FE (route, DTO, mã lỗi, sự kiện SignalR mới) ở `../SmashCourt-BE/docs/api/DEPOSIT_APPROVAL_API.md`. BE đã chạy các thay đổi này phía server (cờ TADSS tắt thì luồng cũ vẫn chạy). "Hôm nay" lấy theo giờ VN, đọc chuỗi ngày giờ của BE chỉ qua `parseBackendDate` / `parseBackendDateVN` (P6-22, T-7, T-8); "hôm nay" và cộng trừ ngày dùng `getTodayVN()`, `addDaysToDateKey()` ở `src/shared/utils/date.ts`, không dùng `toISOString().split("T")[0]`.

## Quy tắc làm việc
- **Không tự ý `git commit` / `push` / `merge` / `rebase` / `reset`** — chỉ khi người dùng yêu cầu rõ ràng (xem `../.claude/rules/git-safety.md`).
- Sửa code xong **phải** chạy `tsc` + `eslint` file đã sửa; xong một feature chạy thêm `npm run build` (skill `build-verify`).
- Tạo page/component/hook/api mới theo skill `smashcourt-fe-architecture`; bắt chước file cùng thư mục.
