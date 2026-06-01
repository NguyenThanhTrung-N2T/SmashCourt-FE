# Manager Dashboard - Quick Start Guide

## 🚀 Getting Started

The Manager Dashboard is now fully integrated and ready to use!

### Access the Dashboard

Navigate to: **`/manager`**

The dashboard will automatically:
- ✅ Fetch real-time data from the API
- ✅ Auto-refresh every 60 seconds
- ✅ Display loading states while fetching
- ✅ Handle errors gracefully

## 📋 What You'll See

### 1. **KPI Cards** (Top Row)
- Revenue Today
- Courts In Use (X/Total)
- Today's Bookings
- Upcoming Check-ins (≤30 min)
- Needs Action (pending payments + refunds)

### 2. **Live Courts** (Priority Grid)
Up to 8 courts sorted by urgency:
- 🔴 **Red**: Pending Payment (needs collection)
- 🟡 **Yellow**: Upcoming Check-in (≤30 min)
- 🟠 **Orange**: No Show Risk (customer late)
- 🟢 **Green**: Playing (in use)
- ⚪ **Gray**: Available (ready)

### 3. **Upcoming Bookings** (Left Column)
Next 10 bookings with:
- Customer info
- Court assignments
- Time slots
- Payment status
- Total amount

### 4. **Action Queue** (Right Column)
Urgent tasks:
- 💰 Pending Payments (collect money)
- ↩️ Pending Refunds (confirm refund)

### 5. **Occupancy Forecast** (Bottom)
Bar chart showing next 8 hours:
- Green bars = Occupied courts
- Gray bars = Available courts
- ⚠️ = Peak risk (≥80% occupancy)

## 🔧 API Requirements

### Endpoint
```
GET /api/reports/dashboard/manager
```

### Authentication
- Requires JWT Bearer token
- Role: `BRANCH_MANAGER`
- Branch-scoped data

### Response Format
```typescript
{
  "success": true,
  "code": "SUCCESS",
  "message": "Dashboard retrieved",
  "data": {
    "branchId": "...",
    "branchName": "...",
    "generatedAt": "2026-06-01T09:15:00Z",
    "kpis": { ... },
    "liveCourts": [ ... ],
    "totalCourts": 10,
    "upcomingBookings": [ ... ],
    "actionQueue": [ ... ],
    "occupancyForecast": [ ... ]
  }
}
```

## 🎯 User Interactions

### Click Actions (Ready for Implementation)

**Live Court Card:**
```typescript
onClick={() => {
  // Navigate to booking detail
  router.push(`/manager/bookings/${court.bookingId}`);
}}
```

**Upcoming Booking Card:**
```typescript
onClick={() => {
  // Navigate to booking detail
  router.push(`/manager/bookings/${booking.bookingId}`);
}}
```

**Action Queue Item:**
```typescript
onClick={() => {
  // Navigate to booking detail
  router.push(`/manager/bookings/${action.bookingId}`);
}}
```

**"View all N courts" Link:**
```typescript
onClick={() => {
  // Navigate to courts page
  router.push('/manager/courts');
}}
```

**"View all bookings" Link:**
```typescript
onClick={() => {
  // Navigate to bookings page
  router.push('/manager/bookings');
}}
```

## 🔄 Auto-Refresh

The dashboard automatically refreshes every **60 seconds**.

To change the interval, edit:
```typescript
// src/features/dashboard/manager/hooks/useManagerDashboard.ts
const AUTO_REFRESH_INTERVAL = 60000; // Change to desired milliseconds
```

## 🎨 Customization

### Colors
Edit status colors in:
```typescript
// src/features/dashboard/manager/utils/dashboard-helpers.ts
export function getAttentionStatusConfig(status: string) {
  // Modify colors here
}
```

### Display Limits
Edit in:
```typescript
// src/features/dashboard/manager/pages/ManagerDashboard.tsx

// Live courts (currently 8)
const displayCourts = sorted.slice(0, 8);

// Upcoming bookings (currently 10)
return data.upcomingBookings.slice(0, 10);

// Occupancy forecast (currently 8 hours)
return data.occupancyForecast.slice(0, 8);
```

## 🐛 Troubleshooting

### Dashboard shows loading forever
- Check API endpoint is accessible
- Verify authentication token is valid
- Check browser console for errors

### "Failed to fetch" error
- Ensure backend API is running
- Check CORS configuration
- Verify API base URL in `.env`

### Empty states showing
- Check if API returns data
- Verify date/time filters
- Ensure branch has bookings/courts

### Auto-refresh not working
- Check browser console for errors
- Verify component is mounted
- Check interval is set correctly

## 📱 Responsive Behavior

- **Mobile (< 640px)**: Single column, stacked layout
- **Tablet (640-1024px)**: 2-column grid for bookings/actions
- **Desktop (1024-1280px)**: 3-column court grid
- **Large (> 1280px)**: 4-column court grid, full layout

## 🔐 Security

- ✅ JWT authentication required
- ✅ Branch-scoped data (manager sees only their branch)
- ✅ Role-based access control
- ✅ Auto token refresh on expiry

## 📊 Performance

- ✅ Memoized computed values
- ✅ Efficient sorting/filtering
- ✅ Skeleton loaders for perceived speed
- ✅ Auto-refresh with cleanup
- ✅ Optimized re-renders

## 🎉 You're Ready!

The Manager Dashboard is production-ready. Just ensure:
1. ✅ Backend API is running
2. ✅ Authentication is configured
3. ✅ User has BRANCH_MANAGER role
4. ✅ Branch has courts and bookings

Navigate to `/manager` and start managing! 🎾
