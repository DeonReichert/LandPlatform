# Project Structure

## Overview

This is a modern full-stack dApp for confidential land planning using:
- **Frontend**: Vite + React + TypeScript
- **Styling**: Tailwind CSS
- **Web3**: wagmi + RainbowKit
- **Smart Contracts**: Hardhat + ZAMA fhEVM

## Directory Structure

```
confidential-land-platform/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages deployment workflow
├── src/
│   ├── components/
│   │   ├── LoadingSpinner.tsx  # Loading states component
│   │   ├── RegisterZoneForm.tsx # Zone registration form
│   │   ├── Toast.tsx           # Toast notification system
│   │   └── TransactionHistory.tsx # Transaction history modal
│   ├── hooks/
│   │   ├── useContract.ts      # Smart contract hooks
│   │   ├── useToast.ts         # Toast notification hook
│   │   └── useTransactions.ts  # Transaction tracking hook
│   ├── lib/
│   │   ├── contract.ts         # Contract ABI and address
│   │   └── wagmi.ts            # Wagmi/RainbowKit config
│   ├── styles/
│   │   └── index.css           # Tailwind CSS + custom styles
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   ├── App.tsx                 # Main application component
│   ├── main.tsx                # Application entry point
│   └── vite-env.d.ts           # Vite type declarations
├── contracts/
│   └── ConfidentialLandPlatform.sol # FHE smart contract
├── scripts/
│   └── deploy.js               # Deployment script
├── .gitignore
├── DEPLOYMENT.md               # Deployment instructions
├── index.html                  # HTML entry point
├── package.json                # Dependencies and scripts
├── postcss.config.js           # PostCSS configuration
├── PROJECT_STRUCTURE.md        # This file
├── README.md                   # Project documentation
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── tsconfig.node.json          # TypeScript config for Node
└── vite.config.ts              # Vite build configuration
```

## Key Features Implemented

### ✅ Frontend Architecture
- [x] Vite + React + TypeScript setup
- [x] Modular component structure
- [x] Custom hooks for reusability
- [x] Type-safe development

### ✅ Styling
- [x] Tailwind CSS integration
- [x] Custom utility classes
- [x] Responsive design
- [x] Dark mode ready (gradients)

### ✅ Web3 Integration
- [x] wagmi v2 for wallet connection
- [x] RainbowKit for UI
- [x] Contract read/write hooks
- [x] Transaction management

### ✅ UI Components (Radix UI)
- [x] Toast notifications
- [x] Dialog modals
- [x] Tabs navigation
- [x] Loading states

### ✅ Error Handling
- [x] Try-catch blocks
- [x] User-friendly error messages
- [x] Toast notifications
- [x] Loading indicators

### ✅ Transaction History
- [x] localStorage persistence
- [x] Status tracking
- [x] Etherscan links
- [x] Clear history

### ✅ Build & Deployment
- [x] ESBuild via Vite
- [x] Code splitting
- [x] GitHub Actions workflow
- [x] GitHub Pages config

## Component Details

### App.tsx
Main application container with:
- Wagmi provider setup
- RainbowKit integration
- Tab navigation
- Layout structure

### RegisterZoneForm.tsx
Zone registration form with:
- Form state management
- Input validation
- Contract interaction
- Loading states
- Error handling

### TransactionHistory.tsx
Transaction tracking with:
- Radix Dialog UI
- Transaction list
- Status indicators
- Clear history function

### Toast.tsx
Notification system with:
- Radix Toast primitives
- 4 types: success, error, warning, info
- Auto-dismiss (5s)
- Custom styling

### LoadingSpinner.tsx
Loading indicators with:
- 3 sizes: sm, md, lg
- Overlay variant
- Custom animations

## Hooks

### useContract.ts
Contract interaction hooks:
- `useContractWrite()` - Write operations
- `useContractRead()` - Read operations
- `useTotalZones()` - Get total zones
- `useTotalProjects()` - Get total projects

### useToast.ts
Toast notification management:
- `showToast()` - Display toast
- `removeToast()` - Remove toast
- Auto-dismiss logic

### useTransactions.ts
Transaction history management:
- `addTransaction()` - Add transaction
- `updateTransactionStatus()` - Update status
- `clearTransactions()` - Clear history
- localStorage persistence

## Configuration Files

### vite.config.ts
- React plugin
- Path aliases (@/)
- Build optimization
- Code splitting
- GitHub Pages base path

### tailwind.config.js
- Custom color palette
- Typography
- Animations
- Responsive breakpoints

### tsconfig.json
- Strict mode
- JSX support
- Path mapping
- Modern ES features

## Smart Contract

### ConfidentialLandPlatform.sol
Features:
- FHE encrypted data storage
- Zone registration
- Project management
- Metrics tracking
- Access control
- Event logging

## Scripts

```json
{
  "dev": "vite",              // Development server
  "build": "tsc && vite build", // Production build
  "preview": "vite preview",   // Preview build
  "compile": "hardhat compile", // Compile contracts
  "deploy": "hardhat run scripts/deploy.js --network sepolia"
}
```

## Environment Variables

Create `.env` for local development:
```
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
PRIVATE_KEY=your_private_key
INFURA_PROJECT_ID=your_infura_id
ETHERSCAN_API_KEY=your_etherscan_key
```

## Next Steps

To extend this project:

1. **Add more forms**:
   - Project submission
   - Metrics update
   - Analysis tools

2. **Enhanced features**:
   - Chart visualizations
   - Real-time updates
   - Multi-language support

3. **Testing**:
   - Unit tests (Vitest)
   - E2E tests (Playwright)
   - Contract tests (Hardhat)

4. **Performance**:
   - Image optimization
   - Lazy loading
   - Service worker

5. **Security**:
   - Input sanitization
   - Rate limiting
   - CSP headers

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Wagmi Documentation](https://wagmi.sh/)
- [RainbowKit Documentation](https://www.rainbowkit.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [ZAMA fhEVM Documentation](https://docs.zama.ai/fhevm)
