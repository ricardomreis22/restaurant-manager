# Why Deployments Differ from Local Development

## Common Causes

### 1. **Environment Variables Missing**
Vercel requires environment variables to be set in the project settings. Check that these are configured:

**Required Environment Variables:**
- `DATABASE_URL` - Your PostgreSQL connection string
- `AUTH_SECRET` - Secret key for NextAuth (generate with: `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your production URL (e.g., `https://your-app.vercel.app`)

**How to set in Vercel:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable for Production, Preview, and Development

### 2. **Prisma Client Not Generated**
The Prisma client must be generated during the build process.

**Solution:** Add a build script to `package.json`:
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

### 3. **Database Connection Issues**
Production databases may have:
- Different connection limits
- SSL requirements
- Connection pooling differences

**Check your DATABASE_URL format:**
```
postgresql://user:password@host:port/database?sslmode=require
```

### 4. **Middleware Size Limits**
Edge functions have size limits (1MB on Hobby plan). We've already optimized this by:
- Using minimal middleware config
- Removing Prisma/bcrypt from middleware

### 5. **Static vs Dynamic Rendering**
Some routes might be statically generated locally but need to be dynamic in production.

**Already fixed:** API routes are marked with `export const dynamic = "force-dynamic"`

### 6. **Session Cookie Issues**
Cookies might not work correctly if:
- `AUTH_SECRET` is missing
- `NEXTAUTH_URL` is incorrect
- Domain/cookie settings differ

### 7. **Build-Time vs Runtime**
- Local: Development mode with hot reload
- Production: Optimized build with static generation

## Quick Checklist

- [ ] All environment variables set in Vercel
- [ ] `AUTH_SECRET` is set and matches between environments
- [ ] `DATABASE_URL` points to production database
- [ ] Prisma client is generated during build
- [ ] Database migrations are run (`npx prisma migrate deploy`)
- [ ] No hardcoded localhost URLs in code
- [ ] All API routes marked as dynamic if needed

## Debugging Steps

1. **Check Vercel Function Logs:**
   - Go to your deployment → Functions tab
   - Look for error messages

2. **Test Environment Variables:**
   - Add temporary logging to verify env vars are loaded
   - Check Vercel environment variable settings

3. **Compare Build Outputs:**
   - Run `npm run build` locally
   - Compare with Vercel build logs

4. **Database Connection:**
   - Test connection string from Vercel environment
   - Verify SSL settings if required

## Common Issues Fixed

✅ Middleware size reduced (removed Prisma/bcrypt)
✅ API routes marked as dynamic
✅ PrismaAdapter removed (JWT strategy doesn't need it)
✅ trustHost added for Vercel
✅ Session strategy configured correctly
✅ Hardcoded localhost URLs replaced with environment variables
✅ Prisma client generation added to build process

## Socket.IO Configuration

The app uses Socket.IO for real-time updates. In production, you need to:

1. **Deploy your Socket.IO server** (in `/server` folder) separately
2. **Set environment variable** in Vercel:
   - `NEXT_PUBLIC_SOCKET_URL` = Your Socket.IO server URL (e.g., `https://your-socket-server.com`)

**Note:** The Socket.IO server must be deployed separately - Vercel serverless functions don't support persistent WebSocket connections. Consider:
- Deploying to a service that supports WebSockets (Railway, Render, Heroku)
- Or using Vercel's Edge Config/Redis for real-time features

