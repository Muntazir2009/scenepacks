# MythicEditz17 - Vercel Deployment Guide

## 🚀 Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (free)
- Neon account (free PostgreSQL)

---

## Step 1: Create Neon Database

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project called `mythiceditz17`
3. Copy your connection strings:
   - `DATABASE_URL` (connection pooling)
   - `DIRECT_URL` (direct connection)

Example:
```
postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/mythiceditz17?sslmode=require
```

---

## Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - MythicEditz17"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mythiceditz17.git
git push -u origin main
```

---

## Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure environment variables:

### Required Environment Variables

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection pooling URL |
| `DIRECT_URL` | Your Neon direct connection URL |
| `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your Vercel URL (e.g., `https://mythiceditz17.vercel.app`) |

5. Click **"Deploy"**

---

## Step 4: Run Database Migration

After deployment, run these commands locally with your production database:

```bash
# Set environment variables or use .env
bun run db:push          # Push schema to Neon
bun run db:seed          # Seed with sample data
```

Or use Vercel CLI:
```bash
vercel env pull .env.production
bun run db:push
bun run db:seed
```

---

## Step 5: Configure Production URL

1. Go to your Vercel project settings
2. Update `NEXTAUTH_URL` to your production domain
3. Redeploy

---

## 🎉 Done!

Your app is now live at `https://your-project.vercel.app`

### Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mythiceditz17.com | admin123 |
| User | demo@example.com | demo123 |

---

## Troubleshooting

### Build Errors
- Check that all environment variables are set
- Ensure `DATABASE_URL` and `DIRECT_URL` are correct

### Database Connection Issues
- Verify Neon database is not suspended (free tier sleeps)
- Check IP allowlist in Neon settings

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Ensure `NEXTAUTH_URL` matches your domain exactly

---

## Optional: Custom Domain

1. Go to Vercel project → Settings → Domains
2. Add your custom domain
3. Update `NEXTAUTH_URL` to match
4. Update DNS records as instructed

---

## Environment Variables Summary

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="https://your-app.vercel.app"
```

---

## Support

- [Vercel Docs](https://vercel.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
