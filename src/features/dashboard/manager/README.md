# Manager Dashboard

Real-time operational dashboard for branch managers to monitor and manage daily operations.

## 📋 Overview

The Manager Dashboard provides a live, action-oriented view of branch operations with:
- Real-time KPI monitoring
- Live court status tracking
- Upcoming bookings preview
- Action queue for urgent tasks
- Occupancy forecasting

## 🎯 Features

### 1. **KPI Cards** (5 metrics)
- **Revenue Today**: Total revenue accumulated today
- **Courts In Use**: Current court utilization (X/Total)
- **Today's Bookings**: Total bookings for the day
- **Upcoming Check-ins**: Bookings starting within 30 minutes
- **Needs Action**: Urgent tasks (pending payments + pending refunds)

### 2. **Live Courts Requiring Attention** (max 8 cards)
Priority-sorted court status cards showing:
- 🔴 **Pending Payment**: Customer needs to pay (highest priority)
- 🟡 **Upcoming Check-in**: Starting within 30 minutes
- 🟠 **No Show Risk**: Customer hasn't arrived (startTime to startTime+15min)
- 🟢 **Playing**: Currently in use
- ⚪ **Available**: Ready for booking

Each card displays:
- Court name and status
- Booking code
- Customer name and phone
- Time range and relative time
- Amount due (for pending payments)

### 3. **Upcoming Bookings** (next 10)
List of upcoming bookings from now until end of day:
- Booking code and status badges
- Customer information
- Assigned courts
- Time range
- Total amount
- Payment status

### 4. **Action Queue**
Urgent tasks requiring immediate attention:
- **Pending Payment**: Collect payment from customer
- **Pending Refund**: Confirm refund for cancelled booking

Each item shows:
- Action type badge
- Booking details
- Customer information
- Amount
- Creation timestamp

### 5. **Occupancy Forecast Chart** (next 8 hours)
Bar chart showing predicted court occupancy:
- Occupied courts (green bars)
- Available courts (gray bars)
- Peak risk indicators (⚠️)
- Hourly breakdown
- Answers: "Are we about to get slammed?"

## 🔄 Auto-Refresh

The dashboard automatically refreshes every **60 seconds** to provide real-time data without manual intervention.

## 🎨 Design System

### Colors
- **Primary Green**: `#1B5E38` (brand color)
- **Secondary Green**: `#2A9D5C`
- **Accent Green**: `#2D7A50`
- **Success**: `#16A34A`
- **Warning**: `#F59E0B`
- **Error**: `#DC2626`

### Status Colors
- **Pending Payment**: Red (`#DC2626`)
- **Upcoming Check-in**: Amber (`#F59E0B`)
- **No Show Risk**: Orange (`#EA580C`)
- **Playing**: Green (`#16A34A`)
- **Available**: Gray (`#64748B`)

### Typography
- **Headings**: Extrabold, tight tracking
- **Body**: Medium weight
- **Labels**: Bold, uppercase, wide tracking
- **Numbers**: Extrabold for emphasis

## 📁 File Structure

```
src/features/dashboard/manager/
├── components/
│   ├── LiveCourtCard.tsx           # Court status card
│   ├── UpcomingBookingCard.tsx     # Booking preview card
│   ├── ActionQueueItem.tsx         # Action item card
│   ├── OccupancyForecastChart.tsx  # Forecast bar chart
│   ├── states/
│   │   ├── DashboardLoading.tsx    # Loading skeletons
│   │   └── DashboardError.tsx      # Error state
│   └── index.ts
├── hooks/
│   └── useManagerDashboard.ts      # Data fetching hook
├── pages/
│   └── ManagerDashboard.tsx        # Main dashboard page
├── utils/
│   └── dashboard-helpers.ts        # Helper functions
├── index.ts
└── README.md
```

## 🔧 Usage

### Basic Usage

```tsx
import { ManagerDashboard } from "@/src/features/dashboard/manager";

export default function ManagerPage() {
  return <ManagerDashboard />;
}
```

### With Custom Filters

```tsx
import { useManagerDashboard } from "@/src/features/dashboard/manager";

function CustomDashboard() {
  const { data, isLoading, error, refetch } = useManagerDashboard({
    fromDate: "2026-06-01",
    toDate: "2026-06-01",
  });

  // Custom implementation...
}
```

## 🛠️ API Integration

### Endpoint
```
GET /api/reports/dashboard/manager
```

### Response Type
```typescript
interface OperationalManagerDashboardDto {
  branchId: string;
  branchName: string;
  generatedAt: string;
  kpis: ManagerDashboardKpiDto;
  liveCourts: LiveCourtAttentionDto[];
  totalCourts: number;
  upcomingBookings: UpcomingBookingDashboardItemDto[];
  actionQueue: ManagerDashboardActionItemDto[];
  occupancyForecast: OccupancyForecastPointDto[];
}
```

## 🎯 Business Rules

### Court Attention Priority
1. **Pending Payment** (Priority 1)
2. **Upcoming Check-in** ≤30min (Priority 2)
3. **No Show Risk** (Priority 3)
   - Time range: [startTime, startTime+15min]
   - Check-in allowed: [startTime-15min, startTime+15min]
4. **Playing** (Priority 4)
5. **Available** (Priority 5)

### Upcoming Bookings
- Shows bookings from current time to end of day
- Excludes past bookings (before current time)
- Maximum 10 items displayed
- Sorted by start time (ascending)

### Action Queue
- **Pending Payment**: Customer hasn't paid yet
- **Pending Refund**: Cancelled booking awaiting refund confirmation
- Sorted by creation time (oldest first)

### Occupancy Forecast
- Shows next 8 hours from current time
- Hourly granularity
- Peak risk threshold: ≥80% occupancy
- Color coding:
  - Red: ≥80% (high)
  - Amber: 60-79% (medium)
  - Green: <60% (low)

## 🔗 Navigation

### Click Actions
- **Live Court Card**: Navigate to booking detail (if booking exists)
- **Upcoming Booking Card**: Navigate to booking detail
- **Action Queue Item**: Navigate to booking detail
- **"View all N courts"**: Navigate to courts page
- **"View all bookings"**: Navigate to bookings page

### TODO: Implement Navigation
```tsx
// In component onClick handlers
onClick={() => {
  router.push(`/manager/bookings/${bookingId}`);
}}
```

## 🧪 Testing Scenarios

### Empty States
- No courts requiring attention
- No upcoming bookings
- No action items
- No forecast data

### Loading States
- Initial load
- Auto-refresh
- Manual refresh

### Error States
- API failure
- Network timeout
- Invalid data

## 🚀 Performance

### Optimizations
- Auto-refresh every 60 seconds (configurable)
- Memoized computed values
- Efficient sorting and filtering
- Lazy loading for large lists
- Skeleton loaders for perceived performance

### Data Limits
- Live courts: Max 8 displayed
- Upcoming bookings: Max 10 displayed
- Action queue: All items displayed
- Forecast: 8 hours (8 data points)

## 📱 Responsive Design

- **Mobile**: Single column layout
- **Tablet**: 2-column grid for bookings/actions
- **Desktop**: Full grid layout with 4-column court cards
- **Large Desktop**: Optimized spacing and sizing

## 🎨 Animations

- **Page Load**: `animate-slide-up` (0.5s ease-out)
- **Card Hover**: Scale + shadow transition
- **Chart Hover**: Tooltip fade-in
- **Refresh Button**: Spin animation when loading

## 🔐 Security

- Requires `BRANCH_MANAGER` role
- Branch-scoped data (manager sees only their branch)
- JWT authentication via `authProtectedFetch`

## 📊 Analytics Events (Future)

```typescript
// Track user interactions
trackEvent("manager_dashboard_viewed");
trackEvent("court_card_clicked", { courtId, status });
trackEvent("booking_card_clicked", { bookingId });
trackEvent("action_item_clicked", { actionType, bookingId });
trackEvent("dashboard_refreshed", { manual: true });
```

## 🐛 Known Issues

None currently. Report issues to the development team.

## 📝 Changelog

### v1.0.0 (2026-06-01)
- Initial implementation
- Real-time KPI monitoring
- Live court status tracking
- Upcoming bookings preview
- Action queue
- Occupancy forecast chart
- Auto-refresh functionality
- Responsive design
- Loading and error states

## 👥 Contributors

- Development Team

## 📄 License

Internal use only - SmashCourt Management System
