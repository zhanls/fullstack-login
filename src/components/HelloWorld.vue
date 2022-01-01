<script setup>
import { computed, ref, useSlots, watchEffect, getCurrentInstance, reactive } from 'vue'

const $axios = getCurrentInstance().appContext.config.globalProperties.$axios;

const props = defineProps({
  msg: String
})

const validateUsername = (rule, value, cb) => {
  const reg = /^[a-zA-Z0-9_-]{4,16}$/
  if (!reg.test(value)) {
    cb(new Error('4到16位（字母，数字，下划线，减号）'))
  } else {
    cb()
  }
}

const validatePassword = (rule, value, cb) => {
  const reg = /^\S*(?=\S{6,})(?=\S*\d)(?=\S*[A-Z])(?=\S*[a-z])(?=\S*[!@#$%^&*? ])\S*$/
  if (!reg.test(value)) {
    cb(new Error("密码强度校验，最少6位，包括至少1个大写字母，1个小写字母，1个数字，1个特殊字符"))
  } else {
    cb()
  }
}

const formRef = ref('');

const ruleForm = reactive({
  username: '',
  password: '',
})

const rules = reactive({
  username: [
    {
      validator: validateUsername,
      trigger: 'blur'
    }
  ],
  password: [
    {
      validator: validatePassword,
      trigger: 'blur'
    }
  ]
})

const sayMsg = computed(() => `say ${props.msg}`)

const slots = useSlots()
console.log(slots.default)

watchEffect(() => {
  console.log(formRef.value)
}, {
  flush: 'post'
})

const reset = () => {
  formRef.value.resetFields()
}

const login = () => {
  formRef.value.validate(passValidation => {
    if (passValidation) {
      $axios.post('/users/login', ruleForm)
    }
  })
}

const logout = () => {
  $axios.post('/users/logout')
}

const getUser = () => {
  $axios.get('/users/getUser')
}
</script>

<template>
  <h1>{{ msg }}</h1>

  <h1>{{ sayMsg }}</h1>

  <slot>默认</slot>

  <el-form
    ref="formRef"
    :model="ruleForm"
    :rules="rules"
    label-width="120px"
  >
    <el-form-item label="用户名" prop="username">
      <el-input
        v-model="ruleForm.username"
        type="text"
        placeholder="请输入用户名"
        clearable
      />
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input
        v-model="ruleForm.password"
        type="password"
        placeholder="请输入密码"
        show-password
        clearable
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="reset">重置表单</el-button>
      <el-button type="primary" @click="login">登录</el-button>
      <el-button type="primary" @click="logout">注销</el-button>
      <el-button type="primary" @click="getUser">获取当前</el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped>
a {
  color: #42b983;
}
</style>
