import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  base: '/LandPlatform/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable for production security
    minify: 'esbuild', // Fast minification
    target: 'es2020',

    // Security & Performance: Code Splitting Strategy
    // Reduces attack surface by isolating critical code
    // Improves load time with lazy loading
    rollupOptions: {
      output: {
        // Manual chunks for security isolation and caching
        manualChunks: (id) => {
          // Critical: Isolate Web3 libraries (attack surface reduction)
          if (id.includes('node_modules/ethers')) {
            return 'ethers-core';
          }
          if (id.includes('node_modules/wagmi') || id.includes('node_modules/viem')) {
            return 'web3-wallet';
          }
          if (id.includes('@rainbow-me/rainbowkit')) {
            return 'rainbowkit';
          }

          // UI Framework isolation
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }

          // Radix UI components (large bundle)
          if (id.includes('@radix-ui')) {
            return 'radix-vendor';
          }

          // Utility libraries
          if (id.includes('node_modules') && !id.includes('@radix-ui')) {
            return 'vendor-utils';
          }
        },

        // Security: Content hashing for cache busting
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',

        // Performance: Smaller chunks
        experimentalMinChunkSize: 10000, // 10kb min chunk size
      }
    },

    // Performance optimization
    chunkSizeWarningLimit: 600, // Warn if chunks exceed 600kb
    reportCompressedSize: true,

    // Security: Tree shaking for dead code elimination
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false
    }
  },

  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
      // Security: Remove console logs in production
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
    // Performance: Pre-bundle dependencies
    include: [
      'react',
      'react-dom',
      'ethers',
      'wagmi',
      'viem',
      '@rainbow-me/rainbowkit'
    ]
  },

  server: {
    port: 1271,
    strictPort: false,
    host: true,
    // Security headers for development
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    }
  },

  // Security: Prevent exposure of sensitive env vars
  envPrefix: 'VITE_',

  // Performance: Enable CSS code splitting
  css: {
    devSourcemap: false,
    modules: {
      localsConvention: 'camelCase'
    }
  }
})
