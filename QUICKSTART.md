# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure WalletConnect

1. Go to https://cloud.walletconnect.com
2. Create a new project
3. Copy your Project ID
4. Update `src/lib/wagmi.ts`:

```typescript
projectId: 'YOUR_PROJECT_ID_HERE'
```

### 3. Start Development Server

```bash
npm run dev
```

Open http://localhost:5173

### 4. Build for Production

```bash
npm run build
```

Output will be in `dist/` folder

## 📱 Using the App

### Connect Wallet

1. Click "Connect Wallet" button
2. Select your wallet (MetaMask, WalletConnect, etc.)
3. Switch to Sepolia network if prompted

### Register a Land Zone

1. Click "Register Zone" tab
2. Fill in the form:
   - Land Area (sq meters)
   - Population Density
   - Land Value per sq meter
   - Zoning Type
   - Public Description
3. Click "Register Confidential Zone"
4. Confirm transaction in wallet
5. Wait for confirmation

### View Transaction History

1. Click "Transaction History" button (top right)
2. See all your transactions
3. Click Etherscan link to view on blockchain

## 🛠️ Smart Contract Deployment

### Deploy to Sepolia

1. Create `.env` file:

```
PRIVATE_KEY=your_private_key
INFURA_PROJECT_ID=your_infura_id
ETHERSCAN_API_KEY=your_etherscan_key
```

2. Compile contracts:

```bash
npm run compile
```

3. Deploy:

```bash
npm run deploy
```

4. Update contract address in `src/lib/contract.ts`

## 🌐 Deploy to GitHub Pages

### Automatic Deployment

1. Push to GitHub:

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Enable GitHub Pages:
   - Go to repository Settings
   - Pages → Source → GitHub Actions
   - Deployment happens automatically

3. Access your site:
   - `https://yourusername.github.io/repository-name/`

### Update Base Path (if needed)

If your repo is `yourusername.github.io/repo-name`, update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/repo-name/',  // Add this line
  // ... rest of config
})
```

## 🎯 Next Steps

### Add More Features

1. **Project Submission Form** - Copy `RegisterZoneForm.tsx` pattern
2. **Metrics Update** - Similar form structure
3. **Analysis Tools** - Use Radix Dialog components
4. **Management Panel** - Admin functions

### Customize Styling

- Edit `tailwind.config.js` for theme
- Modify `src/styles/index.css` for custom styles
- Update colors, fonts, spacing

### Add More Chains

Update `src/lib/wagmi.ts`:

```typescript
import { mainnet, polygon, arbitrum } from 'wagmi/chains';

chains: [sepolia, mainnet, polygon, arbitrum]
```

## 📚 Common Tasks

### Add New Component

```typescript
// src/components/MyComponent.tsx
export function MyComponent() {
  return <div>My Component</div>
}

// src/App.tsx
import { MyComponent } from './components/MyComponent'
```

### Add Contract Function

```typescript
// src/hooks/useContract.ts
export function useMyFunction(arg: number) {
  return useContractRead('myFunction', [BigInt(arg)]);
}
```

### Style with Tailwind

```typescript
<div className="bg-white rounded-xl shadow-lg p-6">
  <h2 className="text-2xl font-bold text-gray-900">Title</h2>
</div>
```

## 🔧 Troubleshooting

### Build Fails

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Wallet Won't Connect

- Check network (must be Sepolia)
- Clear browser cache
- Verify WalletConnect Project ID

### Transaction Fails

- Check wallet has enough ETH
- Verify contract address
- Check network connection
- See browser console for errors

### Blank Page After Deploy

- Verify base path in `vite.config.ts`
- Check GitHub Pages is enabled
- View browser console for errors

## 📖 Documentation

- [Full README](./README.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Project Structure](./PROJECT_STRUCTURE.md)
- [Summary](./SUMMARY.md)

## 💡 Tips

- Use browser DevTools console to debug
- Check Sepolia Etherscan for transaction status
- Keep WalletConnect Project ID secure
- Test on testnet before mainnet
- Use transaction history to track operations

## 🆘 Getting Help

- Check documentation files
- Review code comments
- Inspect browser console
- Test with simple transactions first
- Verify all environment variables

---

**Happy Building! 🎉**
