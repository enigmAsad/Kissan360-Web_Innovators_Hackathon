# Backend Documentation

> [!WARNING]
> **This document describes the full intended scope of the backend, including numerous features that are not currently active.** Many of the API endpoints listed here (such as Appointments, Crops, Records, and Tasks) are not enabled in the primary `server.js` file and will result in a `404 Not Found` error if called. Please refer to `api-docs.md` for a focused guide on the currently active endpoints.

## Project Overview

This backend provides the API for a farming assistance platform. It handles user authentication, data storage for farmers and experts, appointments, blog posts, recommendations, and more.

## Technologies Used

- Node.js
- Express.js
- MongoDB (with Mongoose)
- JSON Web Tokens (JWT) for authentication
- Socket.IO for real-time communication
- Axios for making HTTP requests
- bcrypt for password hashing
- cookie-parser for handling cookies
- cors for enabling Cross-Origin Resource Sharing
- dotenv for managing environment variables
- OpenAI Responses API (via official SDK) for agronomy insights and alerts
- Mapbox Geocoding API for location intelligence

## API Endpoints

### Authentication (`/api/auth`)

-   `POST /signup`: Register a new user (roles accepted: `farmer`, `admin`; `expert` is still accepted as a legacy alias for `admin`).
    -   Controller: `signup`
-   `POST /signin`: Login a user.
    -   Controller: `signin`
-   `POST /signout`: Logout a user.
    -   Controller: `signout`
-   `GET /validate-token`: Validate the user's token.
    -   Controller: `validate-token`

### Comments (`/api/comments`) [protected]

-   `GET /post/:postId`: List comments for a specific post.
    -   Controller: `getCommentsForPost`
-   `POST /post/:postId`: Create a new comment on a post. (Requires authentication)
    -   Controller: `createComment`
-   `PATCH /:id`: Update a comment by its ID. (Requires authentication)
    -   Controller: `updateComment`
-   `DELETE /:id`: Delete a comment by its ID. (Requires authentication)
    -   Controller: `deleteComment`

### Appointments (`/api/appointments`) [INACTIVE]

-   `POST /book`: Book an appointment with an expert. (Requires authentication)
    -   Controller: `bookAppointment`
-   `POST /:appointmentId/accept`: Accept an appointment. (Requires authentication)
    -   Controller: `acceptAppointment`
-   `POST /:appointmentId/decline`: Decline an appointment. (Requires authentication)
    -   Controller: `declineAppointment`
-   `GET /expert`: Get all appointments for the logged-in expert. (Requires authentication)
    -   Controller: `getAppointmentsForExpert`
-   `GET /farmer`: Get all appointments for the logged-in farmer. (Requires authentication)
    -   Controller: `getAppointmentsForFarmer`

### Blog Recommendations (`/api/blog-recommendations`)

-   `GET /blog-recommendations`: Get blog topic recommendations for experts.
    -   Controller: `getBlogRecommendations`
    -   Integrates with the OpenAI Responses API to deliver two concise, expert-ready topics tailored to regional challenges.

### Crops (`/api/crops`)

-   `POST /add`: Add a new crop for the logged-in user. (Requires authentication)
    -   Controller: `addCrop`
-   `GET /`: Get all crops for the logged-in user. (Requires authentication)
    -   Controller: `getAllCrops`
-   `PATCH /update/:id`: Update a crop. (Requires authentication)
    -   Controller: `updateCrop`

### Expert Details (`/api/experts`)

-   `GET /user/profile`: Get the profile of the logged-in user. (Requires authentication)
    -   Controller: `getUserProfile`
-   `GET /:userId`: Get the details of a specific expert. (Requires authentication)
    -   Controller: `getExpertDetails`
-   `POST /`: Add details for the logged-in expert. (Requires authentication)
    -   Controller: `addExpertDetails`
-   `PUT /:userId`: Update the details of a specific expert. (Requires authentication)
    -   Controller: `updateExpertDetails`

### Farmer Details (`/api/farmers`)

-   `GET /user/profile`: Get the profile of the logged-in user. (Requires authentication)
    -   Controller: `getUserProfile`
-   `GET /:userId`: Get the details of a specific farmer. (Requires authentication)
    -   Controller: `getFarmerDetails`
-   `POST /`: Add details for the logged-in farmer. (Requires authentication)
    -   Controller: `addFarmerDetails`
-   `PUT /:userId`: Update the details of a specific farmer. (Requires authentication)
    -   Controller: `updateFarmerDetails`

### Farming News (`/api/news`)

-   `GET /farming_news`: Get the latest farming news.
    -   Controller: `getFarmingNews`

### Get Experts (`/api/get-experts`)

-   `GET /experts`: Get a list of all expert users.
    -   Controller: `getExperts`

### Irrigation (`/api/irrigation`)

-   `POST /:cropId/add`: Add irrigation data for a specific crop. (Requires authentication)
    -   Controller: `addIrrigationData`
-   `GET /:cropId`: Get all irrigation data for a specific crop. (Requires authentication)
    -   Controller: `getAllIrrigationDataByCrop`

### Notifications (`/api/notifications`)

-   `GET /farming-notifications`: Get farming alerts and notifications for a specific region.
    -   Controller: `getFarmingAlerts`
    -   Uses the OpenAI Responses API to synthesize short actionable alerts based on the provided region context.
    -   When the OpenAI integration is unavailable or returns no text, the controller responds with HTTP 200 and a fallback message (`"Update not available\nCheck local advisories"`) plus an optional warning flag.

### Weather (`/api/weather`)

-   `GET /`: Retrieve curated weather insights for key Pakistani cities.
    -   Controller: `getPakistanWeather`
    -   Response: Array of city objects containing condition, temperature, humidity, precipitation chance, category (`rain`, `heat`, `normal`), and mapped coordinates. Includes `generatedAt` timestamp and the Mapbox token required for client-side visualization.
    -   Combines Mapbox Geocoding with maintained baselines to support the front-end Pakistan heatmap when live feeds are unavailable.

### Posts (`/api/posts`)

-   `POST /create`: Create a new blog post. (Requires authentication)
    -   Controller: `createPost`
-   `GET /getPost`: Get all blog posts. (Requires authentication)
    -   Controller: `getAllPost`
-   `GET /user`: Get all posts by the logged-in user. (Requires authentication)
    -   Controller: `getPostsByUser`
-   `GET /:id`: Get a post by its ID. (Requires authentication)
    -   Controller: `getPostById`
-   `PATCH /:id`: Update a post. (Requires authentication)
    -   Controller: `updatePost`
-   `DELETE /:id`: Delete a post. (Requires authentication)
    -   Controller: `deletePost`

### Profile (`/api/profile`) [protected]

-   `GET /region`: Get the logged-in farmer's saved region. (Requires `farmer` role)
    -   Controller: `getRegion`
-   `PUT /region`: Create or update the logged-in farmer's preferred region. (Requires `farmer` role)
    -   Controller: `updateRegion`

### Recommendations (`/api/recommendations`) [INACTIVE]

-   `POST /recommendations`: Get farming recommendations based on provided data.
    -   Controller: `getRecommendations`
    -   Powered by the OpenAI Responses API to produce prioritized tasks, crop care tips, and precautionary advice from farmer inputs.

### Short Advice (`/api/short-advice`)

-   `POST /`: Request quick actionable alerts for farmers. (Requires authentication)
    -   Controller: `getShortAdvice`
    -   Returns 2–3 concise, input-driven advisories such as weather or market reminders.

### Voice Assistant (`/api/voice`)

-   `POST /interact`: Proxy a farmer voice query to the dedicated voice assistant microservice.
    -   Controller: `proxyVoiceInteraction`
    -   Accepts either multipart uploads (`audio` field) or base64 payloads (`audioBase64`). Optional `language` overrides the default Urdu loop.
    -   Response mirrors the downstream service (`transcript`, `response_text`, `audio_base64`, `metadata`). Errors surface as `502 Voice assistant unavailable` when the service cannot be reached.

### Market Data (`/api/market`)

-   `POST /items`: Create a new market item. (Requires `admin` role)
    -   Controller: `createMarketItem`
-   `PATCH /items/:id`: Update a market item. (Requires `admin` role)
    -   Controller: `updateMarketItem`
-   `DELETE /items/:id`: Soft-delete (disable) a market item. (Requires `admin` role)
    -   Controller: `deleteMarketItem`
-   `POST /prices`: Add or update a price for an item in a specific city. (Requires `admin` role)
    -   Controller: `createMarketPrice`
-   `GET /items`: Get a list of all market items, optionally with latest prices for a city.
    -   Controller: `getMarketItems`
-   `GET /items/:id/trend`: Get the 7-day price trend for an item in a specific city.
    -   Controller: `getItemPriceTrend`
-   `GET /compare`: Compare price trends for multiple items in a city.
    -   Controller: `comparePrices`
-   `GET /prices/summary`: Get a summary of market data. (Requires `admin` role)
    -   Controller: `getPricesSummary`

### Records (`/api/records`) [INACTIVE]

-   `POST /add`: Add a new financial record. (Requires authentication)
    -   Controller: `addRecord`
-   `POST /calculate-summary`: Calculate and save the monthly financial summary. (Requires authentication)
    -   Controller: `calculateMonthlySummary`
-   `GET /summary/:year`: Get all monthly summaries for a specific year. (Requires authentication)
    -   Controller: `getMonthlySummary`

### Tasks (`/api/tasks`)

-   `POST /tasks`: Create a new task. (Requires authentication)
    -   Controller: `createTask`
-   `GET /tasks`: Get all tasks for the logged-in user, with optional date filtering. (Requires authentication)
    -   Controller: `getTasks`
-   `GET /task/:date`: Get tasks for a specific date. (Requires authentication)
    -   Controller: `getTaskByDate`
-   `PUT /task/:id`: Update a task. (Requires authentication)
    -   Controller: `updateTask`
-   `GET /tasks/monthly`: Get monthly task statistics. (Requires authentication)
    -   Controller: `getMonthlyTaskStats`
-   `DELETE /task/:id`: Delete a task. (Requires authentication)
    -   Controller: `deleteTask`

### Video Call (`/api/video-call`)

-   `POST /start`: Start a video call.
    -   Controller: `startCall`
-   `POST /join`: Join a video call.
    -   Controller: `joinCall`

## Models

-   **Appointment:** Stores information about appointments between farmers and experts.
    -   `farmerId`: ObjectId of the farmer user.
    -   `expertId`: ObjectId of the expert user.
    -   `status`: (pending, accepted, declined)
    -   `date`: Date of the appointment.
-   **User:** Represents a user of the application.
    -   `name`: String
    -   `email`: String (unique)
    -   `password`: String (hashed)
    -   `role`: (farmer, admin, expert*) — `expert` remains for legacy data but behaves as admin in auth flows.
    -   `socketId`: String
-   **Crop:** Represents a crop belonging to a user.
    -   `name`: String
    -   `growthProgress`: Number
    -   `yieldData`: Array of { month: String, yield: Number }
    -   `irrigationData`: Array of ObjectId references to Irrigation model.
    -   `user`: ObjectId of the user.
-   **ExpertDetails:** Stores additional details for expert users.
    -   `userId`: ObjectId of the user.
    -   `expertStats`: Object with stats like successfulAppointments, farmersHelped, etc.
    -   `appointmentStats`: Object with stats like totalAppointments, satisfactionRating, etc.
    -   `blogEngagement`: Object with stats like views, comments, likes.
-   **FarmerDetails:** Stores additional details for farmer users.
    -   `user`: ObjectId of the user.
    -   `phone`: String
    -   `address`: String
    -   `region`: String
    -   `climate`: String
    -   `cropNames`: Array of Strings
    -   `amountOfLand`: Number
    -   `otherDetails`: String
-   **Irrigation:** Stores irrigation data for a crop.
    -   `crop`: ObjectId of the crop.
    -   `month`: String
    -   `waterUsage`: Number
    -   `forecastedUsage`: Number
    -   `user`: ObjectId of the user.
-   **MonthlySummary:** Stores a monthly summary of earnings and expenditures.
    -   `month`: Number
    -   `year`: Number
    -   `totalEarnings`: Number
    -   `totalExpenditure`: Number
    -   `revenue`: Number
    -   `user`: ObjectId of the user.
-   **Post:** Represents a blog post.
    -   `title`: String
    -   `content`: String
    -   `author`: ObjectId of the user.
-   **Record:** Stores a single financial record.
    -   `date`: Date
    -   `expenditure`: Number
    -   `earnings`: Number
    -   `month`: Number
    -   `year`: Number
    -   `user`: ObjectId of the user.
-   **Task:** Represents a task for a user.
    -   `title`: String
    -   `description`: String
    -   `date`: Date
    -   `isCompleted`: Boolean
    -   `user`: ObjectId of the user.

## Middleware

### `verifyToken`

This middleware is used to protect routes that require authentication. It first checks for a JWT in the request's cookies and falls back to a `Bearer` token in the `Authorization` header. If the token is valid, it decodes the user's ID and role and attaches them to the request object (`req.userId`, `req.userRole`). If the token is missing or invalid, it returns an error.

## Environment Variables

The backend expects the following keys in `backend/.env`:

-   `MONGO_URL`: **Required.** MongoDB connection string.
-   `JWT_SECRET` (preferred) or `JWT_KEY`: **Required.** Secret used to sign application JWTs (one must be set).
-   `PORT`: Optional. The port for the server to listen on (default: `8000`).
-   `CORS_ORIGIN`: Optional. The allowed origin for CORS requests (default: `http://localhost:5173`).
-   `NODE_ENV`: Optional. Set to `production` to enable secure cookies (default: `development`).
-   `OPENAI_API_KEY`: Optional. Credential for OpenAI API integrations (used in recommendations, alerts, etc.).
-   `MAPBOX_TOKEN`: Optional. Access token for Mapbox services used by the weather module.
-   `NEWS_API_KEY`: Optional. API key for the farming news feed (NewsAPI).
-   `VOICE_SERVICE_URL`: Optional. Base URL of the voice assistant microservice (default: `http://localhost:8001`).
-   `VOICE_SERVICE_TIMEOUT_MS`: Optional. HTTP client timeout (ms) when proxying voice requests (default: `20000`).
-   `MAX_VOICE_UPLOAD_BYTES`: Optional. Max upload size for proxied audio in bytes (default: 5 MiB).
