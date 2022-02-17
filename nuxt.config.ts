import { defineNuxtConfig } from 'nuxt3'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  css: [
    // add tailwindcss
    '@/assets/css/main.css',
  ],
  build: {
    postcss: {
      // add Postcss options
      postcssOptions: require('./postcss.config.js'),
    }
  },
  privateRuntimeConfig: {
    UPLOAD_DIR: process.env.UPLOAD_DIR
  }
})
