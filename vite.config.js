import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for better caching
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // Material UI
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'mui-vendor';
            }
            // Animation libraries
            if (id.includes('framer-motion') || id.includes('react-countup') || id.includes('react-intersection-observer')) {
              return 'animation-vendor';
            }
            // Chart libraries
            if (id.includes('recharts') || id.includes('d3')) {
              return 'chart-vendor';
            }
            // Utilities
            if (id.includes('axios') || id.includes('date-fns')) {
              return 'utils-vendor';
            }
            // Other node_modules
            return 'vendor';
          }
          
          // Admin pages chunk
          if (id.includes('/pages/Admin')) {
            return 'admin-pages';
          }
          
          // Admin components chunk
          if (id.includes('/components/features/') && 
              (id.includes('Admin') || id.includes('User') || id.includes('Doctor') || 
               id.includes('Analytics') || id.includes('Audit') || id.includes('Export'))) {
            return 'admin-components';
          }
          
          // Patient/Doctor pages chunk
          if (id.includes('/pages/') && !id.includes('Admin')) {
            return 'user-pages';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    // Enable minification and tree-shaking
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
    ],
  },
})