# Booking Management API

Base URL: `/api/bookings`

All endpoints require staff-or-above auth. Responses are wrapped:

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "...",
  "data": {}
}
```

## Branch Scope

- `OWNER`: can pass `branchId`; if omitted, list/summary/heatmap return data across all branches.
- `BRANCH_MANAGER` / `STAFF`: backend ignores any passed `branchId` and restricts to the user's assigned branch.
- `schedule`: `OWNER` must pass `branchId` because the result is grouped by courts in one branch.

## Date Meaning

All `date`, `fromDate`, `toDate`, `year`, and `month` filters use court usage/play date, not booking creation date.

`createdAt` is only used for sorting in the list endpoint.

## 1. Booking List

`GET /api/bookings`

Query params:

| Param | Type | Notes |
|---|---|---|
| `page` | number | Default `1` |
| `pageSize` | number | Default `10`, max `50` |
| `status` | string | Example `CONFIRMED` |
| `paymentStatus` | string | `UNPAID`, `PARTIALLY_PAID`, `PAID`, `REFUNDED` |
| `branchId` | guid | Owner only effectively controls this |
| `courtId` | guid | Filters bookings containing this court |
| `date` | date | Play date, `YYYY-MM-DD` |
| `fromDate` | date | Play date range start |
| `toDate` | date | Play date range end |
| `customerKeyword` | string | Customer/guest name, phone, or booking id |
| `sortBy` | string | `createdAt`, `bookingDate`, `date`, `status`, `customerName`, `customer`, `finalTotal`, `total` |
| `sortOrder` | string | `asc` or `desc` |

Example:

```http
GET /api/bookings?page=1&pageSize=20&status=CONFIRMED&paymentStatus=PAID&date=2026-05-18&sortBy=createdAt&sortOrder=desc
```

`data` shape:

```json
{
  "items": [
    {
      "id": "guid",
      "branchId": "guid",
      "branchName": "Branch A",
      "customerName": "Nguyen Van A",
      "guestName": null,
      "guestPhone": null,
      "bookingDate": "2026-05-18T00:00:00",
      "status": "CONFIRMED",
      "paymentStatus": "PAID",
      "finalTotal": 350000,
      "courts": [
        {
          "courtId": "guid",
          "courtName": "Court A",
          "startTime": "08:00:00",
          "endTime": "10:00:00"
        }
      ]
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalItems": 100,
  "totalPages": 5,
  "hasNext": true,
  "hasPrev": false
}
```

## 2. Schedule

`GET /api/bookings/schedule`

Query params:

| Param | Type | Required |
|---|---|---|
| `branchId` | guid | Required for `OWNER`; optional/ignored for manager/staff |
| `date` | date | Required, play date |

Example:

```http
GET /api/bookings/schedule?branchId=00000000-0000-0000-0000-000000000001&date=2026-05-18
```

`data` shape:

```json
[
  {
    "courtId": "guid",
    "courtName": "Court A",
    "bookings": [
      {
        "bookingId": "guid",
        "startTime": "08:00",
        "endTime": "10:00",
        "status": "CONFIRMED"
      }
    ]
  }
]
```

Use for timeline and court occupancy views.

## 3. Dashboard Summary

`GET /api/bookings/dashboard-summary`

Query params:

| Param | Type | Notes |
|---|---|---|
| `branchId` | guid | Owner can filter; manager/staff are scoped automatically |

Example:

```http
GET /api/bookings/dashboard-summary?branchId=00000000-0000-0000-0000-000000000001
```

`data` shape:

```json
{
  "todayBookings": 42,
  "activeBookings": 8,
  "completedBookings": 30,
  "cancelledBookings": 3,
  "todayRevenue": 12500000,
  "pendingRefunds": 2
}
```

`today` is based on Vietnam date.

## 4. Calendar Heatmap

`GET /api/bookings/calendar-heatmap`

Query params:

| Param | Type | Required |
|---|---|---|
| `year` | number | Optional; defaults to current Vietnam year if omitted/0 |
| `month` | number | Optional; defaults to current Vietnam month if omitted/0 |
| `branchId` | guid | Owner can filter; manager/staff are scoped automatically |

Example:

```http
GET /api/bookings/calendar-heatmap?year=2026&month=5&branchId=00000000-0000-0000-0000-000000000001
```

`data` shape:

```json
[
  {
    "date": "2026-05-01",
    "bookingCount": 12,
    "occupancyRate": 0.35,
    "revenue": 3500000
  }
]
```

`occupancyRate` is `0..1`, suitable for color intensity. Frontend can map `bookingCount` like:

| Booking count | Color idea |
|---:|---|
| `0` | gray |
| `1-5` | very light green |
| `6-10` | light green |
| `11-20` | medium green |
| `20+` | dark green |

## 5. Booking Detail

`GET /api/bookings/{id}`

Auth: staff-or-above.

Returns one `BookingDto` in `data`, same item shape as the list endpoint but with full court price items and services when available.

```http
GET /api/bookings/00000000-0000-0000-0000-000000000001
```

## 6. Create Online Booking

`POST /api/bookings/online`

Auth: optional. If the user is logged in, backend attaches the booking to that customer. If not logged in, guest info is required.

Request:

```json
{
  "bookingDate": "2026-05-18",
  "courts": [
    {
      "courtId": "guid",
      "startTime": "08:00:00",
      "endTime": "10:00:00"
    }
  ],
  "promotionId": null,
  "guestName": "Nguyen Van A",
  "guestPhone": "0901234567",
  "guestEmail": "a@example.com",
  "note": "Near entrance"
}
```

Rules:

- `courts` must contain at least one court.
- All courts in one booking must share the same `startTime` and `endTime`.
- All courts must belong to the same branch.
- Guest name, phone, and email are required when unauthenticated.

Response `201`:

```json
{
  "bookingId": "guid",
  "paymentUrl": "https://...",
  "expiresAt": "2026-05-18T01:10:00Z",
  "finalTotal": 350000
}
```

## 7. Create Walk-In Booking

`POST /api/bookings/walk-in`

Auth: staff-or-above.

Request:

```json
{
  "bookingDate": "2026-05-18",
  "courts": [
    {
      "courtId": "guid",
      "startTime": "08:00:00",
      "endTime": "10:00:00"
    }
  ],
  "customerId": null,
  "guestName": "Walk-in Guest",
  "guestPhone": "0901234567",
  "guestEmail": null,
  "promotionId": null,
  "note": null,
  "payNow": false
}
```

Rules:

- Use `customerId` for an existing customer, or provide guest name and phone.
- `promotionId` is only valid when `customerId` is provided.
- `payNow=false` means postpaid; `payNow=true` means prepaid at counter.

Response `201`: `BookingDto`.

## 8. Cancel By Staff

`POST /api/bookings/{id}/cancel`

Auth: staff-or-above.

```http
POST /api/bookings/00000000-0000-0000-0000-000000000001/cancel
```

Response:

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Hủy đơn thành công",
  "data": null
}
```

## 9. Confirm Refund

`POST /api/bookings/{id}/confirm-refund`

Auth: staff-or-above.

Used after a cancelled booking has a pending refund.

```http
POST /api/bookings/00000000-0000-0000-0000-000000000001/confirm-refund
```

Response: success wrapper with no data.


## 12. Check In

`POST /api/bookings/{id}/check-in`

Auth: staff-or-above.

```http
POST /api/bookings/00000000-0000-0000-0000-000000000001/check-in
```

Response: success wrapper with no data.

## 13. Checkout

`POST /api/bookings/{id}/checkout`

Auth: staff-or-above.

```http
POST /api/bookings/00000000-0000-0000-0000-000000000001/checkout
```

Response: success wrapper with no data.

## 14. Add Service To Booking

`POST /api/bookings/{id}/services`

Auth: staff-or-above.

Request:

```json
{
  "serviceId": "guid",
  "quantity": 2
}
```

Response `201`: updated `BookingDto`.

## 15. Remove Service From Booking

`DELETE /api/bookings/{id}/services/{serviceId}`

Auth: staff-or-above.

```http
DELETE /api/bookings/00000000-0000-0000-0000-000000000001/services/00000000-0000-0000-0000-000000000002
```

Response: updated `BookingDto`.
