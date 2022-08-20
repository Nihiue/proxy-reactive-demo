import { join } from 'path';

export default {
  base: './',
  resolve: {
    alias: {
      'x-framework': join(__dirname, '../dist/packages/x-framework/index.js')
    }
  },
  server: {
    hmr: false
  }
}