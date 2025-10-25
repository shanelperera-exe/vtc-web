# Vidara Trade Center Frontend: Subdomain Auth Separation

## Overview
This app now supports fully separated authentication for customer and admin panels using subdomains and distinct localStorage keys.

- **Customer site:** https://vidaratecenter.com
  - Uses `localStorage['user_token']` and `localStorage['user_user']`
  - Loads the user-facing app
- **Admin panel:** https://admin.vidaratecenter.com
  - Uses `localStorage['admin_token']` and `localStorage['admin_user']`
  - Loads the admin-only app

Both run from the same build, auto-detecting subdomain at runtime.

## Local Development
1. **Run backend:**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
2. **Run frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
3. **Test subdomains locally:**
   - Edit your `/etc/hosts` file:
     ```
     127.0.0.1 vidaratecenter.local admin.vidaratecenter.local
     ```
   - Start frontend, then visit:
     - http://vidaratecenter.local:5173 → customer app
     - http://admin.vidaratecenter.local:5173 → admin app

4. **API proxy:**
   - Vite proxies `/api` to backend by default. Set `VITE_DEV_API_PROXY` in `.env` if needed.

## Deployment
- Deploy the same frontend build to both subdomains.
- Ensure backend CORS allows both domains.
- No UI changes required; all logic is runtime-detected.

## Token Storage
- Customer: `localStorage['user_token']`, `localStorage['user_user']`
- Admin: `localStorage['admin_token']`, `localStorage['admin_user']`
- Legacy keys (`vtc_access_token`, `vtc_user`) are read for backward compatibility but not written.

## Troubleshooting
- If you see the wrong app, check your subdomain and localStorage keys.
- For local dev, clear localStorage between switching modes.

---
For further details, see `src/api/axios.js` and `src/context/AuthContext.jsx`.
