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

## Farming News

### GET /api/news/farming_news
Returns farming-related news articles from NewsAPI.
- Env required: `NEWS_API_KEY`
- Success (200): `Article[]` (fields from NewsAPI)
- Error (500): `{ message: "Error fetching news" }`

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

## Environment variables
- `MONGO_URL` (required)
- `JWT_KEY` (required)
- `CORS_ORIGIN` (default `http://localhost:5173`)
- `NODE_ENV` (affects cookie flags)
- `NEWS_API_KEY` (for `/api/news/farming_news`)

