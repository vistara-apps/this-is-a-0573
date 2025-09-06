import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Increase chunk size warning limit to avoid warnings for large chunks
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunk splitting to optimize bundle sizes
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'wallet-vendor': ['@rainbow-me/rainbowkit', 'wagmi', 'viem'],
          'ui-vendor': ['lucide-react'],
          'crypto-vendor': ['@dynamic-labs/ethereum', '@dynamic-labs/sdk-react-core'],
          'api-vendor': ['axios', 'openai', '@supabase/supabase-js'],
          'query-vendor': ['@tanstack/react-query']
        }
      }
    },
    // Use default minification to avoid terser dependency issues
    target: 'esnext'
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@rainbow-me/rainbowkit',
      'wagmi',
      'viem',
      'lucide-react',
      '@tanstack/react-query'
    ]
  }
})
