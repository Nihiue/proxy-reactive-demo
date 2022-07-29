import { join } from 'path';

export default {
  base: './',
  resolve: {
    alias: {
      'proxy-reactive-demo': join(__dirname, '../dist/src/index.js')
    }
  },
  server: {
    hmr: false
  }
}