<script setup lang="ts">
import { reactive } from 'vue'

const form = reactive({
  phone: 13618347911,
  pwd: '',
})

const handleSubmit = (e: SubmitEvent) => {
  console.log(e)
}

</script>

<template>
  <h1 class="text-3xl font-bold underline">Hello world!</h1>
  <form @submit.prevent="handleSubmit">
    <input v-model.number="form.phone" placeholder="请输入手机号" type="phone" />
    <input v-model="form.pwd" placeholder="请输入密码" type="password" />
    <button type="submit">登录</button>
  </form>
</template>
