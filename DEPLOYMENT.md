# ChadEmpire Deployment Guide

This guide outlines the steps to deploy the ChadEmpire application to Vercel.

## Prerequisites

- GitHub repository with your ChadEmpire code
- Vercel account
- Supabase project with necessary tables and RLS policies

## Environment Variables

The following environment variables are required for deployment:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## Deployment Options

### Option 1: Vercel Dashboard (Recommended for First Deployment)

1. Log in to your Vercel account
2. Click "Import Project" or "New Project"
3. Connect to your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .next
5. Add the environment variables in the Environment Variables section
6. Click "Deploy"

### Option 2: Vercel CLI

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from the project directory:
   ```bash
   vercel --prod
   ```

4. Follow the prompts to link to your Vercel project and set environment variables

### Option 3: GitHub Actions (CI/CD)

The repository includes a GitHub Actions workflow file (`.github/workflows/ci-cd.yml`) that automates testing and deployment.

To use this workflow:

1. Add the following secrets to your GitHub repository:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

2. Push to the main branch to trigger the workflow

## Post-Deployment

After deployment, verify the following:

1. The application loads correctly
2. Authentication works properly
3. API routes function as expected
4. Real-time features are working

## Troubleshooting

### Common Issues

1. **API Routes Return 500 Errors**
   - Check that all environment variables are correctly set
   - Verify Supabase permissions and RLS policies

2. **Authentication Fails**
   - Ensure cookies are properly configured
   - Check Supabase authentication settings

3. **Real-time Features Not Working**
   - Verify Supabase real-time is enabled for the required tables
   - Check client-side subscription code

### Logs and Monitoring

- View deployment logs in the Vercel dashboard
- Check function logs for API route issues
- Monitor Supabase database queries and performance

## Rollback Procedure

If issues are detected after deployment:

1. In the Vercel dashboard, go to the Deployments tab
2. Find the last working deployment
3. Click the three dots menu and select "Promote to Production"

## Optimizing Performance

1. Enable Vercel Edge Functions for improved global performance
2. Configure Supabase caching for frequently accessed data
3. Implement proper SWR caching strategies
4. Use Vercel Analytics to monitor and optimize performance
