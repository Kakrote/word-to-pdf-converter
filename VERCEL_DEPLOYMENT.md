# 🚀 Vercel Deployment Guide

## Fixed Issues for Vercel Deployment

Your Word to PDF converter is now optimized for Vercel deployment with the following improvements:

### ✅ Changes Made

1. **Added Runtime Configuration** (`app/api/convert/route.ts`)
   - Set `runtime = 'nodejs'` for Node.js runtime
   - Set `dynamic = 'force-dynamic'` to prevent caching
   - Set `maxDuration = 60` for 60-second timeout

2. **Created `vercel.json`**
   - Configured function-specific timeout
   - Ensures API route has enough time to process files

3. **Enhanced Error Handling**
   - Added detailed console logging
   - Better error messages with stack traces
   - Individual file error tracking
   - Response headers for partial failures

4. **Improved Error Reporting**
   - Frontend shows specific error messages
   - Alert dialogs for conversion failures
   - Individual file status tracking

## 🌐 Deploy to Vercel

### Method 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```powershell
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```powershell
   vercel login
   ```

3. **Deploy**
   ```powershell
   cd "c:\Users\anshu\OneDrive\Desktop\New folder\word-to-pdf-converter"
   vercel
   ```

4. **Follow Prompts**
   - Set up and deploy: `Y`
   - Which scope: (select your account)
   - Link to existing project: `N`
   - Project name: (accept default or enter custom name)
   - Directory: `./` (press Enter)
   - Override settings: `N`

5. **Production Deployment**
   ```powershell
   vercel --prod
   ```

### Method 2: Using Vercel Dashboard

1. **Push to GitHub**
   ```powershell
   cd "c:\Users\anshu\OneDrive\Desktop\New folder\word-to-pdf-converter"
   git init
   git add .
   git commit -m "Initial commit - Word to PDF converter"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Import on Vercel**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Click "Deploy"

## 🔧 Vercel Configuration

The following files configure your deployment:

### `vercel.json`
```json
{
  "functions": {
    "app/api/convert/route.ts": {
      "maxDuration": 60
    }
  }
}
```

### Route Configuration in `app/api/convert/route.ts`
```typescript
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
```

## ⚠️ Important Limits

### Free Tier (Hobby)
- **Function Timeout**: 10 seconds
- **Max Request Size**: 4.5 MB
- **Bandwidth**: 100 GB/month

### Pro Tier
- **Function Timeout**: 60 seconds (configured)
- **Max Request Size**: 4.5 MB
- **Bandwidth**: 1 TB/month

**Note**: If you're on the free tier, large files or many files may timeout. Consider upgrading to Pro for the 60-second timeout.

## 🐛 Troubleshooting

### Issue 1: Function Timeout
**Symptom**: "Function execution timed out"

**Solutions**:
1. Upgrade to Vercel Pro for 60-second timeout
2. Limit number of files uploaded at once
3. Process smaller files

### Issue 2: Request Size Too Large
**Symptom**: "Request body too large"

**Solutions**:
1. Limit total upload size to under 4.5 MB
2. Add file size validation in frontend
3. Process files in smaller batches

### Issue 3: Memory Issues
**Symptom**: "Function invocation failed"

**Solutions**:
1. Process fewer files at once
2. Optimize memory usage in code
3. Upgrade Vercel plan

### Issue 4: Module Not Found
**Symptom**: "Cannot find module 'mammoth'"

**Solutions**:
1. Ensure all dependencies are in `package.json`
2. Run `npm install` before deploying
3. Check that `node_modules` is in `.gitignore`

## 📊 Monitoring Deployment

### View Logs
1. Go to your Vercel dashboard
2. Select your project
3. Click on a deployment
4. View "Functions" tab for logs

### Check Function Execution
- Monitor console.log statements
- Check for errors in real-time
- View execution duration

## ✅ Testing After Deployment

1. **Visit Your Deployed URL**
   - Vercel provides a URL like: `your-project.vercel.app`

2. **Test with Small File First**
   - Upload a single small Word document
   - Verify conversion works
   - Check logs if it fails

3. **Test with Multiple Files**
   - Upload 2-3 files
   - Verify batch conversion
   - Check download

4. **Test Folder Upload**
   - Upload a folder with 5-10 files
   - Monitor execution time
   - Verify all files convert

## 🔒 Environment Variables (Optional)

If you want to add API keys or configuration:

1. **In Vercel Dashboard**
   - Go to Project Settings
   - Click "Environment Variables"
   - Add variables

2. **In Code**
   ```typescript
   const apiKey = process.env.MY_API_KEY;
   ```

## 📈 Performance Tips

1. **Optimize Package Size**
   - Only import what you need
   - Use tree-shaking

2. **Add Loading States**
   - Show progress for long operations
   - Prevent user confusion

3. **Add File Size Limits**
   ```typescript
   const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB
   const MAX_TOTAL_SIZE = 4.5 * 1024 * 1024; // 4.5 MB
   ```

4. **Batch Processing**
   - Process files in chunks
   - Avoid timeout issues

## 🎯 Recommended Settings for Production

1. **Add File Validation**
   - Check file size before upload
   - Validate file types
   - Limit number of files

2. **Add Error Boundaries**
   - Graceful error handling
   - User-friendly messages
   - Retry mechanisms

3. **Add Analytics**
   - Track conversions
   - Monitor errors
   - Usage statistics

## 📝 Post-Deployment Checklist

- ✅ Test conversion with single file
- ✅ Test conversion with multiple files
- ✅ Test folder upload
- ✅ Verify error handling
- ✅ Check function logs
- ✅ Test on mobile devices
- ✅ Verify download works
- ✅ Check execution time

## 🚨 Common Vercel-Specific Errors

### Error: "FUNCTION_INVOCATION_FAILED"
- Check function logs in Vercel dashboard
- Verify all dependencies are installed
- Check for runtime errors

### Error: "FUNCTION_INVOCATION_TIMEOUT"
- Reduce number of files
- Upgrade to Pro plan
- Optimize processing code

### Error: "REQUEST_BODY_TOO_LARGE"
- Files exceed 4.5 MB limit
- Add size validation
- Process in smaller batches

## 🎉 Success Indicators

After successful deployment:
- ✅ Site loads at your Vercel URL
- ✅ File upload works
- ✅ Conversion completes
- ✅ ZIP download works
- ✅ No errors in logs
- ✅ Fast response times

## 📞 Getting Help

If issues persist:
1. Check Vercel logs for errors
2. Review this guide
3. Check Vercel documentation
4. Contact Vercel support

---

Your app is now ready for Vercel deployment! 🚀
