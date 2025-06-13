# Vercel Deployment Troubleshooting Guide

## Common Issues with File Upload on Vercel

### 1. Environment Variables

Make sure your `GEMINI_API_KEY` is properly set in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add `GEMINI_API_KEY` with your Google AI Studio API key
4. Deploy again after adding the environment variable

### 2. API Route Debugging

To debug API issues in production:

1. Check Vercel Function logs:
   - Go to your project dashboard
   - Click on **Functions** tab
   - Look for `/api/chat` function logs

2. The enhanced API now includes detailed logging:
   - File processing details
   - Error categorization
   - API key validation

### 3. File Upload Issues

**Common causes:**
- File too large (>10MB limit)
- Unsupported file format
- Base64 encoding issues
- Network timeout

**Solutions:**
- Check browser console for detailed error messages
- Try smaller files first
- Use supported formats: JPEG, PNG, GIF, WebP, PDF, TXT

### 4. Testing File Upload

1. **Test with small image first** (< 1MB)
2. **Check browser console** for any JavaScript errors
3. **Check Vercel function logs** for server-side errors
4. **Verify API key** is working with text-only messages first

### 5. Network Issues

If you get "Connection error":

1. **Check your internet connection**
2. **Try again in a few minutes** (could be temporary Gemini API issue)
3. **Check Gemini API status** at Google AI Studio
4. **Verify API key permissions** in Google AI Studio

### 6. Supported File Types

- **Images**: JPEG, PNG, GIF, WebP
- **Documents**: PDF, Plain Text
- **Size limit**: 10MB per file

### 7. Error Messages

The app now provides specific error messages:
- "API key not configured" → Check environment variables
- "File has no data" → Re-upload the file
- "File type not supported" → Use supported formats
- "Rate limit exceeded" → Wait and try again
- "Invalid API key" → Check your Google AI Studio key

### 8. Local Testing

To test locally before deploying:

```bash
npm run build
npm run start
```

This mimics the production environment.

### 9. Vercel Configuration

The project includes optimized Next.js config for:
- External package handling
- Increased body size limits
- Better error handling

### 10. Getting Help

If issues persist:
1. Check Vercel function logs
2. Test with simple text messages first
3. Verify your Google AI Studio API key works independently
4. Try with different file types/sizes

## Quick Checklist

- [ ] API key added to Vercel environment variables
- [ ] Project redeployed after adding environment variables
- [ ] Test with text-only message first
- [ ] Test with small image file (< 1MB)
- [ ] Check browser console for errors
- [ ] Check Vercel function logs

