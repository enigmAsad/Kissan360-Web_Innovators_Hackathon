# API Documentation (current)

Base URL: `http://localhost:${PORT}` (default PORT=8000)

Auth uses an HTTP-only cookie `token` (JWT). For protected endpoints, include the cookie (browser will send it automatically after signin/signup).

## Authentication

### POST /api/auth/signup
Create a user (`farmer` or `admin`). The value `expert` is accepted as an alias for `admin` to support legacy data, but new admin users should continue to be stored as `admin`.
- Body (JSON):
```
{ "name": "Alice", "email": "alice@example.com", "password": "secret123", "role": "admin" }
```
- Success (201): sets cookie `token`; returns
```
{ "message": "User created successfully", "token": "<jwt>", "role": "admin" }
```

### POST /api/auth/signin
Login with credentials and role (`farmer`, `admin`, or the legacy `expert`).
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
Validates the current session token. The middleware first looks for the HTTP-only cookie `token`, and falls back to an `Authorization: Bearer <token>` header if present.
- Success (200):
```
{ "userId": "<mongoId>", "role": "admin" }
```
- Error (401): `{ "message": "No token found" }` or `{ "message": "Invalid token" }`

Cookie flags:
- Dev: `secure=false`, `sameSite='Lax'`
- Prod (HTTPS): `secure=true`, `sameSite='None'`

Notes:
- JWTs are signed with `process.env.JWT_SECRET` when present, and fall back to `process.env.JWT_KEY` for backward compatibility.
- If neither secret is configured, auth endpoints respond with `500 Authentication service misconfigured`.

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

## Notifications

### GET /api/notifications/farming-notifications
Generate short farming alerts for the requested region.
- Query: `region=Lahore`
- Success (200): `{ alerts: "Alert one\nAlert two", warning?: string }`
- Behavior: If the OpenAI integration fails or no API key is configured, the endpoint still replies with HTTP 200 and a fallback message (`"Update not available\nCheck local advisories"`) alongside an optional `warning` string for observability.

## Weather

### GET /api/weather/
- Success (200):
```
{
    "generatedAt": "2025-11-04T12:00:00.000Z",
    "mapboxToken": "<mapbox-token-if-provided>",
    "cities": [
        {
            "city": "Karachi",
            "condition": "Humid heatwave",
            "temperature": 34,
            "humidity": 68,
            "precipitationChance": 12,
            "category": "heat",
            "coordinates": { "latitude": 24.8607, "longitude": 67.0011 }
        }
    ]
}
```
- Env required: `MAPBOX_TOKEN` (optional; coordinates will fall back to defaults if not provided)
- Error (500): `{ "error": "Failed to load weather data" }`

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
- `JWT_SECRET` (preferred) **or** `JWT_KEY` (legacy) — one of these must be present
- `CORS_ORIGIN` (default `http://localhost:5173`)
- `NODE_ENV` (affects cookie flags)
- `NEWS_API_KEY` (for `/api/news/farming_news`)
- `OPENAI_API_KEY` (optional; enables rich alerts for `/api/notifications/farming-notifications`)
- `MAPBOX_TOKEN` (optional; for `/api/weather`)

