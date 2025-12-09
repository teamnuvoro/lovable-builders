# 📊 Analytics Dashboard Structure Documentation

## 1. Analytics Page Structure (`/admin/analytics`)

### **Page Layout**
- **Route:** `/admin/analytics`
- **Authentication:** Password-protected (password: `nuvoro@101`)
- **Auto-refresh:** Every 5 seconds
- **Max Width:** `max-w-7xl` (1280px)

### **Header Section**
- **Title:** "Analytics Dashboard" with "Protected" badge
- **Date Range Display:** Shows start date, end date, and number of days
- **User Filter Indicator:** Shows truncated user ID when filtering by specific user

**Controls:**
1. **User Selector Dropdown**
   - Default: "All Users (Global View)"
   - Options: List of unique user IDs (truncated to 12 chars)
   - Triggers: `filterUserId` query parameter

2. **Time Range Buttons**
   - "7 Days" (default, highlighted)
   - "30 Days"
   - Updates `days` query parameter

3. **Refresh Button**
   - Manual refresh with loading spinner
   - Calls `refetch()` function

4. **Logout Button**
   - Clears session storage
   - Returns to password dialog

---

### **Section 1: Pulse Cards (4 Cards)**
Grid layout: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`

1. **Active Users (DAU)**
   - Border: Blue (`border-l-blue-500`)
   - Icon: `Users`
   - Value: `dailyActiveUsers` or `totalActiveUsers`
   - Subtitle: "Last {days} days"

2. **Retention Rate**
   - Border: Green (`border-l-green-500`)
   - Icon: `TrendingUp`
   - Value: `retentionRate` (percentage, 1 decimal)
   - Subtitle: "✓ Good" if > 20%, else "Returning users"

3. **Paywall Efficiency**
   - Border: Yellow (`border-l-yellow-500`)
   - Icon: `DollarSign`
   - Value: `paywallEfficiency` (percentage, 1 decimal)
   - Subtitle: "Selection rate"

4. **Avg. Session Time**
   - Border: Purple (`border-l-purple-500`)
   - Icon: `Clock`
   - Value: `avgSessionTime` (converted to minutes)
   - Subtitle: "Average duration"

---

### **Section 2: Engagement Charts (3 Cards)**
Grid layout: `grid-cols-1 lg:grid-cols-3`

1. **Persona Popularity**
   - Type: Horizontal bar chart with percentages
   - Data: `personaPopularity` array
   - Colors: Blue, Purple, Pink, Indigo (rotating)
   - Shows: Persona type, count, and percentage

2. **Conversion Funnel**
   - Type: Horizontal bar chart with gradient
   - Steps:
     - Signup Started
     - OTP Verified
     - Persona Selected
     - Chat Opened
     - Paywall Hit
   - Gradient: `from-blue-500 to-purple-500`
   - Shows: Step label, count, and visual bar

3. **Feature Usage**
   - Type: Horizontal bar chart (green)
   - Features:
     - Voice Call Clicked
     - Summary Clicked
     - Persona Alignment Viewed
   - Color: `bg-green-500`

---

### **Section 3: User Journey Table Preview**
- **Preview:** Shows only first 5 events
- **Button:** "View Full Table" → Links to `/admin/analytics/journey`
- **Display Format:** Card-based list (not table)
- **Columns Shown:**
  - Time (truncated)
  - User ID (truncated to 8 chars)
  - Event Name (code format)
  - Screen (color-coded badge)
  - Explanation (single line, truncated)

**If more than 5 events:**
- Shows "View All {count} Events" button

---

### **Section 4: Raw Data Summary**
Grid layout: `grid-cols-2 md:grid-cols-4`

- Total Events
- Sessions
- Subscriptions
- Payments

---

## 2. User Journey Table Page (`/admin/analytics/journey`)

### **Page Layout**
- **Route:** `/admin/analytics/journey`
- **Max Width:** `max-w-[1800px]` (1800px)
- **Auto-refresh:** Every 10 seconds
- **Back Button:** Returns to `/admin/analytics`

### **Header Section**
- **Title:** "User Journey Table"
- **Subtitle:** "Detailed event tracking and user behavior analysis"

**Controls:**
1. **User Selector Dropdown**
   - Same as main analytics page
   - Resets pagination to page 1 on change

2. **Time Range Buttons**
   - "7 Days" / "30 Days"
   - Resets pagination to page 1 on change

3. **Refresh Button**
   - Manual refresh

---

### **Filter Section (Card)**
Two-column layout on desktop, stacked on mobile:

1. **Search Input**
   - Icon: `Search` (left side)
   - Placeholder: "Search events, screens, or user IDs..."
   - Searches: `event_name`, `event_place`, `user_id`
   - Case-insensitive
   - Resets pagination to page 1 on change

2. **Event Filter Dropdown**
   - Icon: `Filter`
   - Default: "All Events"
   - Options: Unique event names (sorted alphabetically)
   - Resets pagination to page 1 on change

**Filter Status Display:**
- Shows: "Showing {filteredCount} of {totalCount} events"
- Shows: "Auto-refreshing every 10 seconds" with pulsing green dot

---

### **Table Structure**

#### **Table Headers (Sticky)**
- Background: `bg-muted/50`
- Z-index: `z-20` (header), `z-30` (Time column)
- Sticky positioning: Header row and Time column

**Columns:**
1. **Time** (Sticky left, `min-w-[180px]`)
   - Date: `toLocaleDateString()`
   - Time: `toLocaleTimeString()`
   - Font: Monospace, small

2. **User ID** (`min-w-[120px]`)
   - Truncated to 12 chars
   - Clickable: Filters table by this user
   - Font: Monospace, small
   - Color: Blue, hover underline

3. **Event Name** (`min-w-[200px]`)
   - Display: `<code>` tag with background
   - Font: Medium weight

4. **Screen** (`min-w-[150px]`)
   - Color-coded badge (rounded-full)
   - Colors based on `getScreenColor()` function

5. **Explanation** (`min-w-[300px]`)
   - Uses `getEventExplanation()` function
   - Shows layman's terms + property details
   - Font: Small

6. **Properties** (`min-w-[200px]`)
   - Expandable `<details>` element
   - Shows: "View ({count} props)"
   - JSON display: `text-[10px]`, `max-h-60`, scrollable
   - Font: Monospace, small

#### **Table Body**
- Row hover: `hover:bg-muted/30`
- Border: Bottom border on each row
- Empty state: Centered message with helpful text

---

### **Pagination**
**Displayed when:** `totalPages > 1`

**Controls:**
- **Previous Button:** Disabled on page 1
- **Next Button:** Disabled on last page
- **Info:** "Page {current} of {total} ({filteredCount} events)"

**Pagination Logic:**
- Items per page: **50 events**
- Calculation: `Math.ceil(filteredEvents.length / 50)`
- Slice: `filteredEvents.slice((currentPage - 1) * 50, currentPage * 50)`

---

## 3. Sorting and Filtering Structure

### **Backend Filtering (API Level)**

**Endpoint:** `GET /api/admin/analytics`

**Query Parameters:**
1. **`days`** (number, default: 7)
   - Filters events by date range
   - Database query: `.gte('created_at', startDateISO)`
   - Calculates: `startDate = now - days`

2. **`userId`** (string, optional)
   - Required for authentication check
   - Not used for filtering

3. **`filterUserId`** (string, optional)
   - Filters events by specific user
   - Database query: `.eq('user_id', filterUserId)`
   - Applied before mapping events

**Database Query:**
```typescript
let eventsQuery = supabase
  .from('user_events')
  .select('*')
  .gte('created_at', startDateISO)
  .order('created_at', { ascending: false });

if (filterUserId && filterUserId !== 'all') {
  eventsQuery = eventsQuery.eq('user_id', filterUserId);
}

const { data: events } = await eventsQuery.limit(5000);
```

**Sorting:**
- **Default:** `created_at DESC` (newest first)
- **Applied:** At database level
- **Limit:** 5000 events max

---

### **Frontend Filtering (Client Level)**

**Location:** `UserJourneyPage.tsx`

**Filter Chain:**
1. **Backend Filter** (via API)
   - Date range (`days`)
   - User filter (`filterUserId`)

2. **Client-Side Search Filter**
   ```typescript
   const matchesSearch = !searchQuery || 
     event.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     event.event_place.toLowerCase().includes(searchQuery.toLowerCase()) ||
     event.user_id.toLowerCase().includes(searchQuery.toLowerCase());
   ```

3. **Client-Side Event Type Filter**
   ```typescript
   const matchesEventFilter = eventFilter === 'all' || event.event_name === eventFilter;
   ```

4. **Combined Filter**
   ```typescript
   return matchesSearch && matchesEventFilter;
   ```

**Filter Order:**
1. Backend filters (date, user) → `data.recentEvents`
2. Client search filter → `filteredEvents`
3. Client event type filter → `filteredEvents`
4. Pagination → `paginatedEvents`

---

### **Sorting**

**Current Implementation:**
- **No client-side sorting** (table columns are not sortable)
- **Backend sorting only:**
  - Events: `created_at DESC` (newest first)
  - Sessions: `created_at DESC`
  - Applied at database query level

**Event Name Filter Options:**
- Dynamically generated from unique event names in current dataset
- Sorted alphabetically: `Array.from(new Set(...)).sort()`

---

## 4. Data Flow

### **Data Fetching**
1. **Query Key:** `['/api/admin/analytics', days, selectedUserId, user?.id]`
2. **Cache:** React Query cache
3. **Refetch Interval:**
   - Main page: 5 seconds
   - Journey page: 10 seconds
4. **Enabled:** Only when `user?.id` exists (and password authenticated for main page)

### **Data Transformation**
1. **Backend Mapping:**
   ```typescript
   {
     event_time: event.event_time || event.created_at || event.occurred_at,
     user_id: event.user_id || 'N/A',
     event_name: event.event_name || event.event_type || 'unknown',
     event_place: event.event_place || event.path || event.event_data?.screen,
     event_data: event.event_data || event.event_properties || event.metadata || {}
   }
   ```

2. **Frontend Filtering:**
   - Applied to `recentEvents` array
   - Creates `filteredEvents` array
   - Pagination creates `paginatedEvents` array

---

## 5. Color Coding System

### **Screen Badge Colors** (`getScreenColor()`)

**Blue** (`bg-blue-100 text-blue-700 border-blue-200`):
- Place contains: `'chat'`
- Name contains: `'message'` or `'chat'`

**Red** (`bg-red-100 text-red-700 border-red-200`):
- Place contains: `'paywall'`
- Name contains: `'paywall'` or `'limit'`

**Purple** (`bg-purple-100 text-purple-700 border-purple-200`):
- Place contains: `'onboard'`
- Name contains: `'signup'` or `'persona'`

**Green** (`bg-green-100 text-green-700 border-green-200`):
- Name contains: `'payment'` or `'pay_'`

**Gray** (default):
- All other events

---

## 6. Event Translation System

### **Translation Map** (`EVENT_TRANSLATIONS`)
- Maps technical event names to layman's terms
- Located in `AdminAnalytics.tsx`
- Exported for use in `UserJourneyPage.tsx`

### **Explanation Function** (`getEventExplanation()`)
- Base explanation from `EVENT_TRANSLATIONS`
- Adds property details if available:
  - `persona_type`
  - `message_count`
  - `total_messages_sent`
  - `session_length_sec`
  - `placement`
  - `days_since_last_session`
  - `returning_user`

**Format:** `"{baseExplanation} ({detail1}, {detail2}, ...)"`

---

## 7. Key Limitations

1. **No Column Sorting:**
   - Table headers are not clickable
   - Sorting only happens at database level (by `created_at DESC`)

2. **Pagination Reset:**
   - Changing any filter resets to page 1
   - No "remember page" functionality

3. **Search Scope:**
   - Only searches: `event_name`, `event_place`, `user_id`
   - Does not search event properties/JSON data

4. **Event Limit:**
   - Backend: 5000 events max
   - Frontend display: 200 events max (before filtering)
   - Pagination: 50 events per page

5. **User Dropdown Limit:**
   - Shows max 100 unique user IDs
   - Sorted alphabetically

---

## 8. Performance Considerations

1. **Backend:**
   - Fetches up to 5000 events per request
   - Multiple database queries (events, sessions, subscriptions, payments)
   - No pagination at API level

2. **Frontend:**
   - Client-side filtering on potentially large arrays
   - Pagination reduces DOM rendering (50 items max)
   - Auto-refresh every 5-10 seconds (can be resource-intensive)

3. **Optimization Opportunities:**
   - Add backend pagination
   - Add column sorting at API level
   - Debounce search input
   - Virtual scrolling for large tables

