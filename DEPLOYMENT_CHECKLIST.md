# 🚀 Production Deployment Checklist

## AI-Enhanced Search Feature

### ✅ Completed
- [x] AI search implementation with Claude Haiku 3.5
- [x] Server-side API route (`/api/enhance-query`)
- [x] Client-side caching (5-min TTL)
- [x] Conservative AI prompting for relevance
- [x] Graceful fallback to basic search
- [x] TypeScript build passing
- [x] Code pushed to GitHub (commits: `1788d9a`, `f9033a8`)
- [x] Technical documentation (`AI_SEARCH_README.md`)
- [x] User documentation (`AI_SEARCH_USER_GUIDE.md`)
- [x] Project documentation updated (`CLAUDE.md`)

### ⏳ Pending - Required for Production

#### 1. Add Anthropic API Key to Vercel
**Priority: Required for AI search to work in production**

Steps:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add:
   - **Key**: `ANTHROPIC_API_KEY`
   - **Value**: `sk-ant-api03-...` (your Claude API key)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
6. Click **Save**
7. **Redeploy** your application (Vercel may prompt you, or go to Deployments → Redeploy)

**Note**: Without this key, AI search will be disabled but the app will work fine with basic search.

#### 2. Verify Production Deployment
After adding the API key and redeploying:

- [ ] Visit production site: https://www.understoryanalytics.com/search
- [ ] Verify AI toggle appears: "⚡ AI-Enhanced Search"
- [ ] Test search with AI enabled:
  - Search: "laptop" → Should find notebooks, portable computers, etc.
  - Search: "cybersecurity" → Should find network security, cyber defense, etc.
  - Search: "pencils" → Should find office supplies, writing instruments, etc.
- [ ] Check browser console for errors
- [ ] Verify search still works with AI toggle disabled
- [ ] Test that search performance is acceptable (~200-500ms with AI, <100ms cached)

#### 3. Monitor Costs (First Week)
- [ ] Check [Anthropic Console](https://console.anthropic.com/) daily
- [ ] Monitor API usage and costs
- [ ] Expected: ~$0.0003 per search
- [ ] Watch for unexpected usage spikes

### 📊 Post-Deployment Monitoring

**Week 1:**
- Daily cost checks
- User feedback collection
- Error monitoring in Vercel logs
- Search performance metrics

**Week 2-4:**
- Weekly cost reviews
- Adjust AI prompting if needed based on feedback
- Consider A/B testing AI vs basic search

### 🛑 Rollback Plan

If issues arise, disable AI search immediately:

**Option 1: Remove API Key**
1. Vercel Dashboard → Settings → Environment Variables
2. Delete `ANTHROPIC_API_KEY`
3. Redeploy

**Option 2: Git Revert**
```bash
git revert f9033a8 1788d9a
git push origin main
```

Both options will safely disable AI without breaking the app.

### 📝 User Communication

**When to announce:**
- After verifying production deployment works
- After monitoring costs for 2-3 days
- When ready to gather user feedback

**What to share:**
- `AI_SEARCH_USER_GUIDE.md` content
- How to use the AI toggle
- What kind of feedback you want

**Feedback questions:**
- Are results more relevant with AI enabled?
- Any unexpected or irrelevant results?
- What search terms work well vs. poorly?
- Is the 200-500ms delay acceptable?

---

## Summary

**Ready to deploy**: ✅ Code is ready
**Blocking step**: ⏳ Add `ANTHROPIC_API_KEY` to Vercel
**Estimated time**: 5 minutes to add key + 2 minutes to verify

**Next steps:**
1. Add API key to Vercel (5 min)
2. Redeploy and verify (2 min)
3. Monitor for 2-3 days
4. Gather user feedback
5. Iterate based on feedback
