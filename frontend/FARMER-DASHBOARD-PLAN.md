# Farmer Dashboard Implementation Plan

## Theme & Design
- **Reuse Login/Signup theme**: Dark glassmorphism with purple/blue gradients (#6366f1, #8b5cf6)
- **Icons**: Material-UI icons only (no emojis)
- **Layout**: Sidebar + Main content area
- **Font**: Inter (Google Fonts)
- **Effects**: Backdrop blur, smooth transitions, gradient backgrounds

---

## Components Structure

### 1. Layout Components

#### `components/Sidebar/Sidebar.jsx`
- **Purpose**: Navigation for farmer dashboard
- **Links**:
  - Dashboard (Home)
  - Market Prices
  - Price Trends
  - Weather
  - Smart Advice
  - Community Forum
  - My Posts
  - Profile Settings
  - Logout
- **Icons** (Material-UI):
  - `HomeIcon` - Dashboard
  - `ShowChartIcon` - Market Prices
  - `TrendingUpIcon` - Price Trends
  - `CloudIcon` - Weather
  - `LightbulbIcon` - Smart Advice
  - `ForumIcon` - Community Forum
  - `ArticleIcon` - My Posts
  - `PersonIcon` - Profile
  - `LogoutIcon` - Logout
- **Features**:
  - Active link highlighting
  - Collapsible on mobile
  - User info display (name, role badge)
  - Kissan360 logo/branding

#### `components/Layout/DashboardLayout.jsx`
- **Purpose**: Wrapper for sidebar + outlet
- **Structure**: 
  ```
  <div className="dashboard-layout">
    <Sidebar />
    <div className="main-content">
      <Outlet /> {/* React Router */}
    </div>
  </div>
  ```

---

## Pages (Farmer Only)

### 2. Dashboard Home - `pages/FarmerDashboard/FarmerHome.jsx`

**API**: None (displays cards linking to other sections)

**Components**:
- Welcome card with user name
- Quick stats cards:
  - Total market items available
  - Active forum posts
  - Latest weather update timestamp
- Quick action cards (navigate to):
  - View Market Prices
  - Check Weather
  - Get Smart Advice
  - Visit Forum

**Icons**: 
- `AgricultureIcon` - Market
- `CloudIcon` - Weather
- `LightbulbIcon` - Advice
- `ForumIcon` - Forum

---

### 3. Market Prices - `pages/MarketPrices/MarketPrices.jsx`

**API**: 
- `GET /api/market/items?city={region}` (Public)
- Uses farmer's saved region from profile

**Features**:
- Region selector dropdown (updates profile via `PUT /api/profile/region`)
- Table/Grid of market items with:
  - Item name
  - Category (vegetable/fruit)
  - Latest price (from city)
  - Last updated date
  - "View Trend" button → navigates to Price Trends page

**Components**:
- `components/MarketPriceCard/MarketPriceCard.jsx` - Individual item card
- Region selector

**Icons**:
- `LocalFloristIcon` - Vegetable
- `AppleIcon` - Fruit
- `TrendingUpIcon` - View Trend button

---

### 4. Price Trends - `pages/PriceTrends/PriceTrends.jsx`

**API**: 
- `GET /api/market/items` (to list items)
- `GET /api/market/items/:id/trend?city={region}` (7-day trend)

**Features**:
- Item selector dropdown
- City/Region input
- Line chart (Recharts) showing 7-day price trend
- Carry-forward visualization (dotted line for missing days)
- Price change indicator (% increase/decrease from day 1 to day 7)

**Components**:
- `components/TrendChart/TrendChart.jsx` - Recharts line chart

**Icons**:
- `ShowChartIcon` - Trend chart
- `ArrowUpwardIcon` / `ArrowDownwardIcon` - Price change indicators

---

### 5. Weather - `pages/Weather/Weather.jsx`

**API**: 
- `GET /api/weather/` (Public)

**Features**:
- Display Pakistan cities weather data
- Cards for each city showing:
  - City name
  - Temperature
  - Condition (Humid heatwave, Cloudy, etc.)
  - Humidity %
  - Precipitation chance
  - Weather category badge (heat, rain, cold, etc.)
- Mapbox map (optional) showing city markers
- Filter by weather category

**Components**:
- `components/WeatherCard/WeatherCard.jsx` - Individual city weather

**Icons**:
- `WbSunnyIcon` - Heat/Sunny
- `CloudIcon` - Cloudy
- `ThunderstormIcon` - Rain
- `AcUnitIcon` - Cold
- `WaterDropIcon` - Humidity

---

### 6. Smart Advice - `pages/SmartAdvice/SmartAdvice.jsx`

**API**: 
- `GET /api/short-advice?item={itemId}&city={city}&rainExpected={bool}` (Public)
- `GET /api/market/items` (to populate item selector)

**Features**:
- Form inputs:
  - Item selector (dropdown)
  - City input
  - Rain expected? (checkbox)
- Display advice as bullet points
- Based on last 3 days price trend
- Advice card with icon

**Components**:
- Advice display card

**Icons**:
- `LightbulbIcon` - Advice
- `CheckCircleIcon` - Recommendation items
- `WaterDropIcon` - Rain toggle

---

### 7. Community Forum - `pages/Forum/ForumList.jsx`

**API**: 
- `GET /api/posts/getPost` (Auth)
- `POST /api/posts/create` (Auth)

**Features**:
- List all posts (newest first)
- Each post card shows:
  - Title
  - Content preview (truncated)
  - Author name
  - Created date
  - Comment count indicator
  - "View Details" button → navigate to `PostDetail`
- "Create New Post" button (opens modal/form)
- Create post form:
  - Title input
  - Content textarea
  - Submit button

**Components**:
- `components/PostCard/PostCard.jsx` - Forum post preview card
- `components/CreatePostModal/CreatePostModal.jsx` - Post creation form

**Icons**:
- `ForumIcon` - Forum
- `AddCircleIcon` - Create post
- `CommentIcon` - Comment count
- `PersonIcon` - Author

---

### 8. Post Detail - `pages/Forum/PostDetail.jsx`

**API**: 
- `GET /api/posts/:id` (Auth)
- `GET /api/comments/post/:postId` (Public)
- `POST /api/comments/post/:postId` (Auth)
- `PATCH /api/posts/:id` (Auth, if owner)
- `DELETE /api/posts/:id` (Auth, if owner)
- `PATCH /api/comments/:id` (Auth, if owner)
- `DELETE /api/comments/:id` (Auth, if owner)

**Features**:
- Display full post (title, content, author, date)
- Edit/Delete buttons (if post owner)
- Comments section:
  - List all comments (newest first)
  - Author name, content, timestamp
  - Edit/Delete buttons (if comment owner)
- Add comment form (textarea + submit)

**Components**:
- `components/CommentCard/CommentCard.jsx` - Individual comment
- `components/AddCommentForm/AddCommentForm.jsx` - Comment creation

**Icons**:
- `EditIcon` - Edit post/comment
- `DeleteIcon` - Delete post/comment
- `SendIcon` - Submit comment
- `ReplyIcon` - Reply/Comment

---

### 9. My Posts - `pages/MyPosts/MyPosts.jsx`

**API**: 
- `GET /api/posts/user` (Auth - logged-in user's posts)

**Features**:
- List posts created by the logged-in farmer
- Same card layout as Forum but with prominent edit/delete actions
- Quick stats: Total posts created

**Components**:
- Reuse `PostCard` component with edit/delete emphasis

**Icons**:
- `ArticleIcon` - Posts
- `EditIcon` - Edit
- `DeleteIcon` - Delete

---

### 10. Profile Settings - `pages/Profile/ProfileSettings.jsx`

**API**: 
- `GET /api/profile/region` (Auth: Farmer)
- `PUT /api/profile/region` (Auth: Farmer)

**Features**:
- Display current region
- Form to update region:
  - Region input (text or dropdown of Pakistan cities)
  - Save button
- Display user info (name, email, role)
- Success/error toast notifications

**Components**:
- Profile info card
- Region preference form

**Icons**:
- `PersonIcon` - Profile
- `LocationOnIcon` - Region
- `SaveIcon` - Save changes

---

## Shared Components

### 11. `components/StatCard/StatCard.jsx`
- Reusable card for dashboard stats
- Props: `icon`, `title`, `value`, `color`
- Glassmorphism style

### 12. `components/LoadingSpinner/LoadingSpinner.jsx`
- Centered spinner for loading states
- Material-UI `CircularProgress`

### 13. `components/EmptyState/EmptyState.jsx`
- Display when no data (e.g., no posts, no prices)
- Props: `icon`, `message`, `action` (optional button)

---

## Routing Structure (React Router)

```javascript
/farmer-dashboard
  ├── / (Home - FarmerHome)
  ├── /market-prices (MarketPrices)
  ├── /price-trends (PriceTrends)
  ├── /weather (Weather)
  ├── /smart-advice (SmartAdvice)
  ├── /forum (ForumList)
  ├── /forum/:id (PostDetail)
  ├── /my-posts (MyPosts)
  └── /profile (ProfileSettings)
```

All routes wrapped in `DashboardLayout` with `Sidebar`.

---

## File Structure

```
src/
├── pages/
│   ├── FarmerDashboard/
│   │   ├── FarmerHome.jsx
│   │   └── FarmerHome.scss
│   ├── MarketPrices/
│   │   ├── MarketPrices.jsx
│   │   └── MarketPrices.scss
│   ├── PriceTrends/
│   │   ├── PriceTrends.jsx
│   │   └── PriceTrends.scss
│   ├── Weather/
│   │   ├── Weather.jsx
│   │   └── Weather.scss
│   ├── SmartAdvice/
│   │   ├── SmartAdvice.jsx
│   │   └── SmartAdvice.scss
│   ├── Forum/
│   │   ├── ForumList.jsx
│   │   ├── ForumList.scss
│   │   ├── PostDetail.jsx
│   │   └── PostDetail.scss
│   ├── MyPosts/
│   │   ├── MyPosts.jsx
│   │   └── MyPosts.scss
│   └── Profile/
│       ├── ProfileSettings.jsx
│       └── ProfileSettings.scss
├── components/
│   ├── Layout/
│   │   ├── DashboardLayout.jsx
│   │   └── DashboardLayout.scss
│   ├── Sidebar/
│   │   ├── Sidebar.jsx
│   │   └── Sidebar.scss
│   ├── MarketPriceCard/
│   │   ├── MarketPriceCard.jsx
│   │   └── MarketPriceCard.scss
│   ├── TrendChart/
│   │   ├── TrendChart.jsx
│   │   └── TrendChart.scss
│   ├── WeatherCard/
│   │   ├── WeatherCard.jsx
│   │   └── WeatherCard.scss
│   ├── PostCard/
│   │   ├── PostCard.jsx
│   │   └── PostCard.scss
│   ├── CommentCard/
│   │   ├── CommentCard.jsx
│   │   └── CommentCard.scss
│   ├── CreatePostModal/
│   │   ├── CreatePostModal.jsx
│   │   └── CreatePostModal.scss
│   ├── AddCommentForm/
│   │   ├── AddCommentForm.jsx
│   │   └── AddCommentForm.scss
│   ├── StatCard/
│   │   ├── StatCard.jsx
│   │   └── StatCard.scss
│   ├── LoadingSpinner/
│   │   ├── LoadingSpinner.jsx
│   │   └── LoadingSpinner.scss
│   └── EmptyState/
│       ├── EmptyState.jsx
│       └── EmptyState.scss
└── utils/
    └── api.js (already created)
```

---

## Implementation Order

1. ✅ **Auth & Context** (Already done)
   - Login, Signup, AuthContext, API utils

2. **Layout & Navigation**
   - DashboardLayout
   - Sidebar
   - Update App.jsx routing

3. **Dashboard Home**
   - FarmerHome with quick action cards
   - StatCard component

4. **Market Features**
   - MarketPrices page
   - MarketPriceCard component
   - PriceTrends page
   - TrendChart component

5. **Weather & Advice**
   - Weather page
   - WeatherCard component
   - SmartAdvice page

6. **Community Forum**
   - ForumList page
   - PostCard component
   - PostDetail page
   - CommentCard component
   - CreatePostModal
   - AddCommentForm
   - MyPosts page

7. **Profile**
   - ProfileSettings page

8. **Shared Components**
   - LoadingSpinner
   - EmptyState

---

## API Integration Notes

- All authenticated requests use `api.js` (already includes cookie/token)
- Farmer region preference loaded once and stored in local state/context
- Toast notifications for all mutations (create, update, delete)
- Error handling with user-friendly messages
- Loading states during API calls

---

## Material-UI Icons to Install

Already in `package.json` (`@mui/icons-material`):
- HomeIcon
- ShowChartIcon
- TrendingUpIcon
- CloudIcon
- LightbulbIcon
- ForumIcon
- ArticleIcon
- PersonIcon
- LogoutIcon
- AgricultureIcon
- LocalFloristIcon
- AppleIcon (or FruitIcon)
- ArrowUpwardIcon
- ArrowDownwardIcon
- WbSunnyIcon
- ThunderstormIcon
- AcUnitIcon
- WaterDropIcon
- CheckCircleIcon
- AddCircleIcon
- CommentIcon
- EditIcon
- DeleteIcon
- SendIcon
- LocationOnIcon
- SaveIcon

---

## Ready to Implement?

This plan covers all farmer-specific features using only the APIs from `api-docs.md`. No admin functionality will be touched. Shall I proceed with implementation?

