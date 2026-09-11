import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
<<<<<<< HEAD

// https://vite.dev/config/
=======
import path from 'path'

>>>>>>> 8122ee6 (Update MyJukeBox codebase)
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {}
<<<<<<< HEAD
  }
})
=======
  },
  resolve: {
    alias: {
      'jsmediatags': path.resolve(__dirname, 'node_modules/jsmediatags/dist/jsmediatags.min.js'),
    }
  },
  build: {
    rollupOptions: {
      external: ['react-native-fs', 'fs', 'buffer'],
    }
  }
})
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
