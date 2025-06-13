# 🔧 Quick Fix Checklist for Vercel File Upload Issues

## Essential Steps (Do These First):

### 1. ✅ Environment Variables
- [ ] Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
- [ ] Add `GEMINI_API_KEY` with your actual API key
- [ ] **IMPORTANT**: Redeploy after adding the environment variable

### 2. ✅ Test API Key
- [ ] First test with **text-only messages** (no files)
- [ ] If text works, the API key is correct
- [ ] If text doesn't work, check your API key in Google AI Studio

### 3. ✅ Test File Upload Gradually
- [ ] Try a **small image first** (< 1MB)
- [ ] Use supported formats: JPEG, PNG, GIF, WebP
- [ ] Check browser console for error messages

### 4. ✅ Check Vercel Logs
- [ ] Go to **Vercel Dashboard** → Your Project → **Functions**
- [ ] Look for `/api/chat` function logs
- [ ] Check for specific error messages

## Enhanced Features Added:

✅ **Better Error Handling**: Now shows specific error messages  
✅ **Detailed Logging**: Console logs help debug issues  
✅ **File Validation**: Checks file size, type, and data integrity  
✅ **API Key Validation**: Verifies environment setup  
✅ **Model Selection**: Automatically uses vision-capable models for files  

## Common Error Messages & Solutions:

| Error Message | Solution |
|---------------|----------|
| "API key not configured" | Add GEMINI_API_KEY to Vercel environment variables |
| "File has no data" | Re-upload the file, check file isn't corrupted |
| "File type not supported" | Use JPEG, PNG, GIF, WebP, PDF, or TXT files |
| "Rate limit exceeded" | Wait a few minutes, try again |
| "Invalid API key" | Check your Google AI Studio API key |
| "Connection error" | Check internet, verify API key works |

## If Still Not Working:

1. **Clear browser cache** and try again
2. **Test locally first**: `npm run build && npm run start`
3. **Try different file types/sizes**
4. **Check Google AI Studio** - make sure your API key has proper permissions
5. **Check Vercel function timeout** - large files might need more time

## Success Indicators:

✅ Text-only messages work  
✅ Small images (< 1MB) upload successfully  
✅ No console errors in browser  
✅ Vercel function logs show successful processing  
✅ AI responds to image analysis requests  

---

**Remember**: Always test with **text messages first** to ensure basic functionality works before testing file uploads!

