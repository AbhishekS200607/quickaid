# Community Emergency Directory

A mobile-first emergency contact directory where users can view verified emergency numbers and submit new ones for verification.

## Setup Instructions

### 1. Install Dependencies
```bash
cd emergency-app
npm install
```

### 2. Configure Supabase

Create a Supabase project and run this SQL:

```sql
create table emergency_contacts (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  name text not null,
  phone text not null,
  category text not null,
  city text not null,
  description text,
  is_verified boolean default false,
  upvotes int default 0
);
```

### 3. Environment Variables

Edit `.env` file with your credentials (already configured)

### 4. Import Emergency Numbers Database

```bash
node import-data.js
```

This will load 30+ verified emergency numbers including:
- National numbers (112, 100, 101, 108, etc.)
- State-specific helplines
- Specialized services

### 5. Run the Application

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

Visit `http://localhost:3000`

## Admin Dashboard

Access the admin panel at:
```
http://localhost:3000/admin.html
```

**To set admin password:**
```bash
node generate-hash.js
# Copy the hash and update ADMIN_PASSWORD_HASH in .env
```

## Deployment

### Frontend (Vercel)
- Deploy the `/public` folder as a static site
- Set environment variable for API URL

### Backend (Render)
- Deploy the Node.js app
- Add environment variables from `.env`

## Features

✅ Mobile-first design with large touch targets
✅ Click-to-call functionality
✅ City and category filtering
✅ Real-time search
✅ User submissions (pending verification)
✅ Rate limiting to prevent spam
✅ Input sanitization for security
✅ Admin approval system

## Security Notes

- All user submissions require manual approval
- Phone numbers are validated with regex
- Rate limiting: 5 submissions per 15 minutes
- Input sanitization prevents XSS
- Admin endpoints are password protected
