import { defineNuxtPlugin } from '#app'
import axios from 'axios'

const service = axios.create({
  baseURL: '/api'
})

let count = 0

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.globalProperties.$axios = service;
  console.log("🚀 ~ file: axios.ts ~ line 9 ~ count", ++count)
}) 