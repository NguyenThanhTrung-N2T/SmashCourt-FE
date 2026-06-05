# AI API Documentation

Base path: `/api/AI`

All responses are wrapped:
```json
{ "success": true, "data": { ... } }
```

Date format for requests: `"YYYY-MM-DD"` (ISO 8601).  
`GeneratedAt` in responses is an ISO 8601 datetime string.

---

## Rate Limits

| Policy | Limit | Applies to |
|---|---|---|
| `ai-public` | 100 req/min | Public endpoints |
| `ai-user` | 20 req/min | Customer endpoints |
| `ai-management` | 10 req/min | Management endpoints |

---

## 1. Public Chat

### `POST /api/AI/chat`

**Auth**: None (AllowAnonymous)

**Request**
```json
{
  "message": "Làm thế nào để đặt sân?",   // required, 1–2000 chars
  "sessionId": "uuid-v4"                   // optional, for conversation context
}
```

**Response** `data: ChatResponseDto`
```json
{
  "reply": "Để đặt sân, bạn truy cập...",
  "suggestions": ["Xem bảng giá", "Đặt sân ngay"],
  "model": "gemini-2.0-flash",
  "sessionId": "uuid-v4",
  "generatedAt": "2026-05-27T10:30:00Z"
}
```

> **Note**: Backend builds context server-side. Do NOT send any user-specific data.

---

### `GET /api/AI/chat/faq`

**Auth**: None (AllowAnonymous)

**Response** `data: FaqItemDto[]`
```json
[
  {
    "question": "Làm sao để đặt sân?",
    "answer": "Bạn có thể đặt sân qua...",
    "category": "booking"
  },
  {
    "question": "Giá thuê sân là bao nhiêu?",
    "answer": "Giá dao động từ...",
    "category": "pricing"
  }
]
```

---

## 2. Booking Suggestion (Customer)

### `POST /api/AI/suggest/booking`

**Auth**: `CUSTOMER` role, Bearer token required

**Request** — all fields optional
```json
{
  "branchId": "8e441a54-aa47-4da5-a7a4-8784f57c3ae5",
  "date": "2026-05-28",
  "courtType": "VIP"
}
```

> Backend fetches the user's booking history via JWT claims. Frontend must NOT send `userId` or history data.

**Response** `data: BookingSuggestionResponseDto`
```json
{
  "suggestions": [
    {
      "type": "time_slot",
      "title": "Khung giờ phù hợp",
      "description": "Bạn thường chơi vào 18:00–20:00 cuối tuần",
      "action": "Đặt ngay",
      "metadata": { "startTime": "18:00", "endTime": "20:00" }
    }
  ],
  "model": "gemini-2.0-flash",
  "generatedAt": "2026-05-27T10:30:00Z"
}
```

**`type` values**: `"time_slot"` | `"branch"` | `"court_type"`

---

## 3. Pricing Suggestion (Manager / Owner)

### `POST /api/AI/suggest/pricing`

**Auth**: `OWNER` or `BRANCH_MANAGER` role, Bearer token required

**Branch scoping**:
- `BRANCH_MANAGER`: `branchId` is ignored — backend enforces their own branch.
- `OWNER`: uses provided `branchId` (or all branches if null).

**Request**
```json
{
  "branchId": "8e441a54-aa47-4da5-a7a4-8784f57c3ae5",  // optional for OWNER
  "fromDate": "2026-05-01",                              // required
  "toDate": "2026-05-31"                                 // required
}
```

**Response** `data: PricingSuggestionResponseDto`
```json
{
  "suggestions": [
    {
      "timeSlot": "18:00-20:00",
      "dayOfWeek": "Saturday",
      "currentPrice": 200000,
      "suggestedIncreasePercent": 15.0,
      "suggestedPrice": 230000,
      "reasoning": "Tỷ lệ lấp đầy cao vào cuối tuần tối",
      "confidence": 0.87
    }
  ],
  "model": "gemini-2.0-flash",
  "generatedAt": "2026-05-27T10:30:00Z",
  "success": true,
  "message": null
}
```

**Constraints**: `suggestedIncreasePercent` ∈ [-20, +30], `confidence` ∈ [0, 1].

> **Important**: This is advisory only — prices are NOT updated automatically.

---

## 4. Promotion Suggestion (Manager / Owner)

### `POST /api/AI/suggest/promotions`

**Auth**: `OWNER` or `BRANCH_MANAGER` role, Bearer token required

**Branch scoping**: Same as Pricing Suggestion.

**Request**
```json
{
  "branchId": "8e441a54-aa47-4da5-a7a4-8784f57c3ae5",  // optional for OWNER
  "fromDate": "2026-05-01",                              // required
  "toDate": "2026-05-31"                                 // required
}
```

**Response** `data: PromotionSuggestionResponseDto`
```json
{
  "branchId": "8e441a54-aa47-4da5-a7a4-8784f57c3ae5",
  "suggestions": [
    {
      "timeSlot": "06:00-08:00",
      "dayOfWeek": "Monday",
      "currentOccupancyPercent": 20.5,
      "discountPercent": 30,
      "targetSegment": "Students",
      "suggestedDurationDays": 14,
      "estimatedRevenueImpact": 5000000,
      "reasoning": "Giờ thấp điểm buổi sáng đầu tuần"
    }
  ],
  "model": "gemini-2.0-flash",
  "generatedAt": "2026-05-27T10:30:00Z"
}
```

**Constraints**: `discountPercent` ∈ [10, 50].

> **Important**: This is advisory only — promotions are NOT created automatically.

---

## 5. Analytics Summary (Manager / Owner)

### `POST /api/AI/analytics/summary`

**Auth**: `OWNER` or `BRANCH_MANAGER` role, Bearer token required

**Branch scoping**: Same as Pricing Suggestion.

**Request**
```json
{
  "branchId": "8e441a54-aa47-4da5-a7a4-8784f57c3ae5",  // optional for OWNER
  "fromDate": "2026-05-01",                              // required
  "toDate": "2026-05-31"                                 // required
}
```

**Response** `data: AnalyticsSummaryResponseDto`
```json
{
  "branchId": "8e441a54-aa47-4da5-a7a4-8784f57c3ae5",
  "branchName": "Chi nhánh Quận 1",
  "period": "2026-05-01 to 2026-05-31",
  "overview": "Trong tháng 5, chi nhánh đạt doanh thu 150 triệu VNĐ...",
  "highlights": [
    "Tỷ lệ lấp đầy cao nhất vào cuối tuần (85%)",
    "Giờ cao điểm: 18:00–21:00"
  ],
  "concerns": ["Tỷ lệ huỷ tăng 5% so với tháng trước"],
  "recommendations": ["Tăng giá giờ cao điểm cuối tuần"],
  "model": "gemini-2.0-flash",
  "generatedAt": "2026-05-27T10:30:00Z"
}
```

---

## 6. Strategic Suggestions (Owner Only)

### `POST /api/AI/analytics/strategic`

**Auth**: `OWNER` role ONLY — `BRANCH_MANAGER` is forbidden (403)

**Request**
```json
{
  "fromDate": "2026-05-01",   // required
  "toDate": "2026-05-31"      // required
}
```

**Response** `data: StrategicSuggestionResponseDto`
```json
{
  "branchPerformance": [
    {
      "branchId": "uuid",
      "branchName": "Chi nhánh Quận 1",
      "performanceRating": "Excellent",
      "strengths": ["Tỷ lệ lấp đầy cao", "Doanh thu ổn định"],
      "weaknesses": ["Chi phí vận hành cao"]
    }
  ],
  "staffingSuggestions": [
    {
      "branchId": "uuid",
      "branchName": "Chi nhánh Quận 1",
      "suggestion": "Tăng nhân sự cuối tuần",
      "reasoning": "Thời gian checkout tăng 20% vào thứ 7"
    }
  ],
  "expansionOpportunities": [
    {
      "location": "Quận 7",
      "opportunity": "Nhu cầu cao, chưa có chi nhánh",
      "reasoning": "Dữ liệu booking khu vực lân cận tăng mạnh",
      "priority": 0.82
    }
  ],
  "demandForecast": {
    "summary": "Dự báo nhu cầu tăng 15% trong tháng tới",
    "predictions": ["Cuối tuần tháng 6 tăng 20%", "Ngày lễ 30/4 có nhu cầu cao"]
  },
  "model": "gemini-2.0-flash",
  "generatedAt": "2026-05-27T10:30:00Z"
}
```

**`performanceRating` values**: `"Excellent"` | `"Good"` | `"Needs Improvement"`

---

## Error Responses

| Status | Scenario |
|---|---|
| `400` | Validation failed (e.g. missing required fields, invalid date format) |
| `401` | Missing or invalid JWT token |
| `403` | Insufficient role (e.g. BRANCH_MANAGER calling `/analytics/strategic`) |
| `429` | Rate limit exceeded |

```json
{
  "success": false,
  "message": "Error description",
  "errorCode": "UNAUTHORIZED"
}
```
