# Deployment Guide

## Pre-Deployment Checklist

- [ ] Database schema created in Supabase
- [ ] Emergency numbers imported
- [ ] Environment variables configured
- [ ] Admin password changed
- [ ] CORS origins set for production
- [ ] HTTPS enabled on hosting platform

## Environment Variables

Copy `.env.example` and configure:

```bash
SUPABASE_URL=          # From Supabase dashboard
SUPABASE_KEY=          # Anon/public key from Supabase
PORT=3000
ADMIN_PASSWORD_HASH=   # Run: node generate-hash.js
JWT_SECRET=            # Run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ALLOWED_ORIGINS=       # Your production domain(s), comma-separated
```

## Deploy to Render

1. Connect GitHub repository
2. Set environment variables in dashboard
3. Build command: `npm install`
4. Start command: `npm start`

## Deploy to Vercel

1. `vercel deploy`
2. Add environment variables in project settings
3. Redeploy

## Enable Supabase RLS

```sql
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read verified"
ON emergency_contacts FOR SELECT
USING (is_verified = true);

CREATE POLICY "Anyone can submit"
ON emergency_contacts FOR INSERT
WITH CHECK (is_verified = false);
```

## Post-Deployment

- [ ] Test admin login at `/admin.html`
- [ ] Verify SOS buttons work
- [ ] Test submission form
- [ ] Check mobile responsiveness
- [ ] Monitor rate limiting

## Security Features

✅ JWT tokens (24h expiration)
✅ Authorization header (not query string)
✅ Rate limiting on all endpoints
✅ CORS whitelist
✅ Bcrypt password hashing
✅ Input validation
✅ Logout functionality
