# API Documentation (current)

Base URL: `http://localhost:${PORT}` (default PORT=8000)

Auth uses an HTTP-only cookie `token` (JWT). For protected endpoints, include the cookie (browser will send it automatically after signin/signup).

## Authentication

### POST /api/auth/signup
Create a user (admin or farmer).
- Body (JSON):
```
{ "name": "Alice", "email": "alice@example.com", "password": "secret123", "role": "admin" }
```
- Success (201): sets cookie `token`; returns
```
{ "message": "User created successfully", "token": "<jwt>", "role": "admin" }
```

### POST /api/auth/signin
Login with credentials and role.
- Body (JSON):
```
{ "email": "alice@example.com", "password": "secret123", "role": "admin" }
```
- Success (200): sets cookie `token`; returns
```
{ "message": "Logged in successfully", "token": "<jwt>", "role": "admin" }
```

### POST /api/auth/signout
Clears the session cookie.
- Success (200):
```
{ "message": "Logged out successfully" }
```

### GET /api/auth/validate-token
Validates JWT cookie.
- Success (200):
```
{ "userId": "<mongoId>", "role": "admin" }
```
- Error (401): `{ "message": "No token found" }` or `{ "message": "Invalid token" }`

Cookie flags:
- Dev: `secure=false`, `sameSite='Lax'`
- Prod (HTTPS): `secure=true`, `sameSite='None'`

## Forum (Posts) [protected]
All endpoints require auth cookie.

### POST /api/posts/create
Create a post for the logged-in user.
- Body:
```
{ "title": "My update", "content": "Harvest next week" }
```
- Success (201): `{ message, post }`

### GET /api/posts/getPost
Get all posts.
- Success (200): `Post[]`

### GET /api/posts/user
Get posts created by the logged-in user.
- Success (200): `Post[]`

### GET /api/posts/:id
Get a post by id.
- Success (200): `Post`
- Not found (404): `{ message: "Post not found" }`

### PATCH /api/posts/:id
Update a post you own.
- Body:
```
{ "title": "New title", "content": "Updated content" }
```
- Success (200): `{ message, post }`
- Not authorized/not found (404): `{ message }`

### DELETE /api/posts/:id
Delete a post you own.
- Success (200): `{ message: "Post deleted successfully" }`

## Comments

### GET /api/comments/post/:postId
List comments for a post (newest first).
- Success (200): `Comment[]`

### POST /api/comments/post/:postId [auth]
Create a comment on a post.
- Body:
```
{ "content": "Great update!" }
```
- Success (201): `{ message, comment }`

### PATCH /api/comments/:id [auth]
Update your comment.
- Body:
```
{ "content": "Edited comment" }
```
- Success (200): `{ message, comment }`
- Not authorized/not found (403/404): `{ message }`

### DELETE /api/comments/:id [auth]
Delete your comment (admin can moderate).
- Success (200): `{ message: "Comment deleted" }`

## Profile (Farmer Preference)

### GET /api/profile/region [auth: farmer]
Return the farmer's saved region.
- Success (200): `{ region: "Lahore" | null }`

### PUT /api/profile/region [auth: farmer]
Create/update the farmer's preferred region.
- Body:
```
{ "region": "Karachi" }
```
- Success (200): `{ message: "Region saved", region: "Karachi" }`

## Farming News

### GET /api/news/farming_news
Returns farming-related news articles from NewsAPI.
- Env required: `NEWS_API_KEY`
- Success (200): `Article[]` (fields from NewsAPI)
- Error (500): `{ message: "Error fetching news" }`

## Weather

### GET /api/weather/current
- Query: `city=Lahore`
- Success (200):
```
{ "city": "Lahore", "country": "PK", "temperatureC": 30.5, "humidity": 48, "condition": "clear sky", "icon": "01d", "windSpeed": 3.6, "dt": 1730716800 }
```
- Env required: `OPENWEATHER_API_KEY` (or `WEATHER_API_KEY`)
- Error (500): `{ message: "Failed to fetch weather" }`

## Short Advice

### GET /api/short-advice
Generate short advice using recent price trend; optionally include rain signal from FE.
- Query: `item=<itemId>&city=Lahore&rainExpected=true|false`
- Success (200): `{ item: { id, name }, city, advice: ["..."] }`
- Notes: Uses last 3 days of prices for trend; no weather API calls are made here.

## Market Data

### POST /api/market/items
- Auth: Admin only
- Body: `{ "name": "Tomato", "category": "vegetable", "unit": "kg", "description": "Fresh tomato" }`
- Success (201): `{ message: "Item created", item }`

### PATCH /api/market/items/:id
- Auth: Admin only
- Body: any of `{ name, category, unit, description, enabled }`
- Success (200): `{ message: "Item updated", item }`
- Not found (404): `{ message }`

### DELETE /api/market/items/:id
- Auth: Admin only
- Behavior: soft-disable (`enabled=false`)
- Success (200): `{ message: "Item disabled", item }`

### POST /api/market/prices
- Auth: Admin only
- Body: `{ "item": "<itemId>", "city": "Lahore", "date": "2025-11-04", "price": 220, "currency": "PKR" }`
- Success (200): `{ message: "Price saved", upserted: true|false }`

### GET /api/market/items
- Auth: Public
- Query: `city=Lahore` (optional)
- Success (200):
  - Without city: `MarketItem[]`
  - With city: array of items with `{ latestPrice, lastUpdated }`

### GET /api/market/items/:id/trend
- Auth: Public
- Query: `city=Lahore` (required)
- Success (200): `{ item, city, data: [{ date: "YYYY-MM-DD", price }] }` (7 days; missing values are carried forward)

### GET /api/market/compare
- Auth: Public
- Query: `items=tomatoId,potatoId&city=Lahore`
- Success (200): `{ city, series: [{ itemId, name, unit, data: [{ date, price }] }] }`

-### GET /api/market/prices/summary
- Auth: Admin only
- Query: `city=Lahore` (optional)
- Success (200): `{ totalItems, totalPrices, avgPrice, lastPriceDate }`

## Environment variables
- `MONGO_URL` (required)
- `JWT_KEY` (required)
- `CORS_ORIGIN` (default `http://localhost:5173`)
- `NODE_ENV` (affects cookie flags)
- `NEWS_API_KEY` (for `/api/news/farming_news`)
- `OPENWEATHER_API_KEY` or `WEATHER_API_KEY` (for `/api/weather/current`)

