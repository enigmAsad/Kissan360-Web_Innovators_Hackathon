# Authentication Setup - Kissan360

## ✅ Complete Authentication System Implemented

### Features
- 🔐 JWT-based authentication with HTTP-only cookies
- 👤 Role-based access (Farmer/Admin)
- 🎨 Agricultural-themed UI with glassmorphism design
- 🛡️ Protected routes with role validation
- 🔄 Auto token validation on app load
- 📱 Fully responsive design

---

## 📁 Files Created

### Core Files
- `src/utils/api.js` - Axios instance configured for backend API
- `src/context/AuthContext.jsx` - Authentication state management
- `src/App.jsx` - Main app with routing and auth guards

### Pages
- `src/pages/Login/Login.jsx` + `.scss` - Login page
- `src/pages/Signup/Signup.jsx` + `.scss` - Signup page
- `src/pages/FarmerDashboard/FarmerDashboard.jsx` + `.scss` - Farmer dashboard
- `src/pages/AdminDashboard/AdminDashboard.jsx` - Admin dashboard

### Entry Points
- `src/main.jsx` - React app entry
- `src/index.css` - Global styles
- `src/app.css` - App-level styles

---

## 🚀 How to Run

### 1. Ensure Backend is Running
```bash
cd backend
npm start
```
Backend should be running on `http://localhost:8000`

### 2. Start Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

---

## 🔑 API Endpoints Used (from api-docs.md)

### Authentication
- `POST /api/auth/signup` - Create new user (farmer/admin)
- `POST /api/auth/signin` - Login with credentials
- `POST /api/auth/signout` - Logout and clear cookie
- `GET /api/auth/validate-token` - Validate current session

All endpoints use HTTP-only cookies for secure token storage.

---

## 🎯 User Flow

### New User
1. Visit `http://localhost:5173` → redirects to `/login`
2. Click "Sign up" → `/signup`
3. Fill form (name, email, password, role: farmer/admin)
4. Submit → auto-login → redirect to dashboard

### Existing User
1. Visit `/login`
2. Enter email, password, select role
3. Submit → redirect to `/farmer/dashboard` or `/admin/dashboard`

### Protected Routes
- `/farmer/dashboard` - Farmer-only (role check)
- `/admin/dashboard` - Admin-only (role check)
- Auto-redirect if wrong role or not authenticated

---

## 🎨 Design Features

### Theme
- **Colors**: Dark mode with purple/blue accents (#6366f1, #8b5cf6)
- **Font**: Inter (Google Fonts)
- **Effects**: Glassmorphism, backdrop blur, gradient backgrounds
- **Icons**: Emoji-based (🌾 for farmer, 👨‍💼 for admin)

### Components
- Animated wheat icon on auth pages
- Toast notifications for feedback
- Smooth transitions and hover effects
- Responsive grid layouts

---

## 🔧 Environment Variables

Ensure `frontend/.env` has:
```
VITE_API_URL=http://localhost:8000
```

(Currently hardcoded in `api.js`, can be env-driven later)

---

## 🧪 Test Accounts

Create test accounts via signup:

**Farmer Account**
- Role: Farmer
- Email: farmer@test.com
- Password: farmer123

**Admin Account**
- Role: Admin
- Email: admin@test.com
- Password: admin123

---

## 📝 Next Steps

1. ✅ Basic auth flow complete
2. 🔜 Add market price features to farmer dashboard
3. 🔜 Add admin panel for managing market data
4. 🔜 Implement weather widget
5. 🔜 Add community forum
6. 🔜 Build profile/region preferences

---

## 🐛 Troubleshooting

### "Login failed" Error
- Ensure backend is running on port 8000
- Check MongoDB connection in backend
- Verify JWT_SECRET in backend/.env

### Cookie Not Set
- Ensure `withCredentials: true` in API calls
- Check CORS settings in backend
- Use `sameSite: 'Lax'` for localhost

### Token Validation Fails
- Clear browser cookies
- Sign up a new account
- Check backend logs for JWT errors

---

## 🎉 Ready for Development

The authentication system is fully functional and ready for building additional features!

