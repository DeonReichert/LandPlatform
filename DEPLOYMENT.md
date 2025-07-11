# Deployment Guide

## GitHub Pages Deployment

### Automatic Deployment

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository Settings
   - Navigate to Pages section
   - Source: GitHub Actions
   - The deployment will happen automatically on every push to main

3. **Access your site**:
   - Your site will be available at: `https://yourusername.github.io/repository-name/`

### Manual Build

```bash
# Build the project
npm run build

# The output will be in the `dist` folder
# You can deploy this folder to any static hosting service
```

## Configuration Checklist

### Before Deployment

- [ ] Update WalletConnect Project ID in `src/lib/wagmi.ts`
- [ ] Verify contract address in `src/lib/contract.ts`
- [ ] Update base path in `vite.config.ts` if needed
- [ ] Test build locally: `npm run build && npm run preview`
- [ ] Update repository URL in README.md

### Environment Variables

For local development, create a `.env` file:

```
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

Update `src/lib/wagmi.ts` to use:
```typescript
projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID'
```

## Vite Configuration for GitHub Pages

If your repository name is not at root (e.g., `https://username.github.io/repo-name/`), update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/repo-name/', // Add your repository name
  // ... rest of config
})
```

## Alternative Hosting Options

### Vercel

1. Import your GitHub repository
2. Build command: `npm run build`
3. Output directory: `dist`
4. Deploy

### Netlify

1. Connect your GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy

### IPFS/Fleek

1. Build: `npm run build`
2. Upload `dist` folder to IPFS
3. Get CID for access

## Troubleshooting

### Build Errors

- Check Node.js version (requires 18+)
- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Verify all dependencies are installed

### Deployment Fails

- Check GitHub Actions logs
- Verify Pages is enabled in repository settings
- Ensure workflow has proper permissions

### Blank Page After Deployment

- Check browser console for errors
- Verify base path in vite.config.ts
- Check if assets are loading correctly
- Ensure contract address is correct for Sepolia

## Post-Deployment

1. Test wallet connection
2. Test contract interactions
3. Verify transaction history works
4. Check mobile responsiveness
5. Test on different browsers

## Security Notes

- Never commit private keys or sensitive data
- Use environment variables for API keys
- Enable branch protection rules
- Review security advisories regularly
