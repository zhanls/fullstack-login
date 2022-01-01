import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:3001'
axios.defaults.withCredentials = true
axios.interceptors.response.use(
  response => {
    // document.getElementById('log').append(JSON.stringify(response.data))
    return response;
  }
);
const app = createApp(App)
app.use(ElementPlus)
app.config.globalProperties.$axios = axios;
app.mount('#app')
