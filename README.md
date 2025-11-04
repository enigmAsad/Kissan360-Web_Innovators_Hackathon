# Smart Agriculture Market Tracker – Backend Setup (Auth First)

This repo implements the Web Innovators Hackathon brief. We’re starting by porting authentication from an existing agriculture project and aligning it to the hackathon scope.

## Scope for this step
- Users: Admin, Farmer
- Auth: Signup, Signin, Signout, Validate Token
- Cookies (HTTP-only) JWT session
- MongoDB for user storage

## Endpoints
- `POST /api/auth/signup` – Create user (role: `admin` or `farmer`)
- `POST /api/auth/signin` – Login and receive session cookie
- `POST /api/auth/signout` – Logout and clear session cookie
- `GET /api/auth/validate-token` – Validate cookie + return user role/id

## Environment
Create a `.env` in `backend/`:
```
MONGO_URL=your-mongodb-uri
JWT_KEY=your-jwt-secret
PORT=8000
CORS_ORIGIN=http://localhost:5173
```

## Run locally
```bash
cd backend
npm install
npm run dev # or: node server.js
```

## Notes
- Roles are restricted to `admin` and `farmer` (aligned with the brief).
- Cookie flags are suitable for development; harden for production (secure, sameSite) when using HTTPS.
- Next steps after auth: market data models/routes, price trends, weather module, and forum.
# CUI-Web_Innovators_Hackathon