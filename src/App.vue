<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import { reactive } from '@vue/reactivity'
import HelloWorld from './components/HelloWorld.vue'
const obj = reactive({
  name: 'App'
})
</script>

<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <HelloWorld msg="Hello Vue 3 + Vite" >
    <div>插槽{{ obj.name }}</div>
    <template #custom="slotProps">
      覆盖自定义，{{ slotProps.item }}
    </template>
  </HelloWorld>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
