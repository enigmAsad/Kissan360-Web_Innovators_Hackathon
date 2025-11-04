# Frontend Models Reference

This document describes the data shapes returned/expected by the backend for the features currently enabled: Authentication and Forum (Posts). Use this as a contract while implementing the frontend.

## User (auth.model.js)
- _id: string (Mongo ObjectId)
- name: string (required)
- email: string (required, unique)
- password: string (hashed, never returned)
- role: 'admin' | 'farmer' (required)
- createdAt: ISO datetime
- updatedAt: ISO datetime

Notes:
- Authentication uses an HTTP-only cookie named `token` (JWT). After successful signup/signin, the cookie is set and must be sent with subsequent requests to protected endpoints (e.g., posts CRUD).
- In development (`NODE_ENV !== 'production'`), cookie flags are: `secure: false, sameSite: 'Lax'`.
- In production, cookie flags are: `secure: true, sameSite: 'None'` (requires HTTPS).

## Post (post.model.js)
- _id: string (Mongo ObjectId)
- title: string (required)
- content: string (required)
- author: string (User _id) or populated User object
- createdAt: ISO datetime

Notes:
- Create/update payloads accept: `{ title, content }`.
- The backend associates the `author` from the authenticated user (decoded from the JWT) and does not require it in the payload.
- Authorization: only the post owner can update or delete their post.

