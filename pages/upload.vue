<script setup lang="ts">
import SparkMD5 from 'spark-md5'
// 大文件上传：先算MD5，再进行上传
import { ref, getCurrentInstance } from 'vue'
const axios = getCurrentInstance().appContext.config.globalProperties.$axios;
const CHUNK_SIZE = 0.5 * 1024 * 1024 // 一个chunk最多0.5MB
interface chunk {
  progress: number;
  blob: Blob;
}

const file = ref<File>()
const isDragging = ref<boolean>(false)
const chunks = ref<Array<chunk>>([])
const uploadProgress = ref<number>(0)
const hashProgress = ref<number>(0)

const createFileChunk = (size: number = CHUNK_SIZE) => {
  for (let i = 0; i < file.value.size; i += size) {
    chunks.value.push({
      progress: 0,
      blob: file.value.slice(i, i + size)
    })
  }
}
const calculateHashByWorker = () => new Promise<string>((resolve, reject) => {
  const worker = new Worker('/hash.js')
  worker.postMessage({
    blobs: chunks.value.map(v => v.blob)
  })
  worker.onmessage = e => {
    const { progress, hash } = e.data
    hashProgress.value = progress
    if (hash) {
      resolve(hash)
    }
  }
})
const calculateHashByIdle = () => new Promise<string>((resolve, reject) => {
  const taskList = chunks.value.map(v => v.blob)
  const step = Number(100 / taskList.length)
  const spark = new SparkMD5.ArrayBuffer()
  let taskHandle = 0 // idleTask id

  // 利用requestIdleCallback调用浏览器空闲时间进行计算
  const runTaskQueue = (deadline: IdleDeadline) => {
    // 当前eventLoop有空闲时间可以运行callback，并且当前任务队列还没完成时
    while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && taskList.length) {
      console.log("🚀 ~ file: upload.vue ~ line 43 ~ runTaskQueue ~ taskList.length", taskList.length)
      // 把文件的数据添加到spark中，如果搞定了，就返回最后一个hash？
      const reader = new FileReader()
      reader.readAsArrayBuffer(taskList.shift())
      reader.onload = e => {
        spark.append(e.target.result)
        if (!taskList.length) {
          hashProgress.value = 100
          resolve(spark.end())
        } else {
          hashProgress.value = Number((hashProgress.value + step).toFixed(2)) // 0.1+0.2!==0.3问题
          console.log("🚀 ~ file: upload.vue ~ line 53 ~ runTaskQueue ~ hashProgress.value", hashProgress.value)
        }
      }
    }
    // 如果还有任务
    if (taskList.length) {
      taskHandle = requestIdleCallback(runTaskQueue)
    } else {
      taskHandle = 0
    }
  }

  // 第一次执行runTaskQueue
  taskHandle = requestIdleCallback(runTaskQueue)
})
const uploadFile = async () => {
  createFileChunk()
  hashProgress.value = 0
  const hash = await calculateHashByWorker()
  // const hash1 = await calculateHashByIdle()
  // 传给后端的数据
  const requests = chunks.value.map((chunk, index) => {
    const form = new FormData()
    form.append('name', `${hash}-${index}`)
    form.append('chunk', chunk.blob)
    return axios.post('/uploadfile', form, {
      onUploadProgress: progress => {
        chunks.value[index].progress = Number(((progress.loaded / progress.total) * 100).toFixed(2))
      }
    })
  })
  Promise.all(requests)
}
const onDragOver = () => {
  isDragging.value = true
}
const onDragLeave = () => {
  isDragging.value = false
}
const onDrop = (e: DragEvent) => {
  const fileList = e.dataTransfer.files
  isDragging.value = false
  file.value = fileList[0]
}
const handleFileChange = (e: Event) => {
  const fileList = (e.target as HTMLInputElement).files
  if (!fileList.length) return
  file.value = fileList[0]
}
</script>

<template>
  <div class="relative">
    <div
      :class="[
        'py-4',
        'border-2',
        'border-dashed',
        isDragging ? 'border-indigo-500' : 'border-indigo-200',
        'flex',
        'flex-col',
        'justify-center',
        'items-center'
      ]"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop="onDrop"
    >
      <input
        type="file"
        name="file"
        accept="video/*"
        class="block text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        @change="handleFileChange"
      />
      <label class="mt-5">
        哈希抽样进度:
        <progress :value="hashProgress" max="100"></progress>
        {{ hashProgress }}%
      </label>
      <label class="mt-5">
        上传进度:
        <progress :value="uploadProgress" max="100"></progress>
        {{ uploadProgress }}%
      </label>
    </div>
    <button @click="uploadFile">上传</button>
    <hr class="py-8">
    <h1>双飞翼布局</h1>
    <main>
      <div class="w-full bg-yellow-500 float-left">
        <div class="ml-[200px] mr-[200px] min-w-[50px]">
          中间
        </div>
      </div>
      <div class="float-left w-[200px] bg-red-500 -ml-[100%]">左边</div>
      <div class="float-left w-[200px] bg-blue-500 -ml-[200px]">右边</div>
    </main>
    <hr class="py-8">
    <h1>圣杯布局</h1>
    <main class="pr-[200px] pl-[200px] bg-green-500">
      <div class="float-left w-full bg-yellow-500 min-w-[50px]">中间</div>
      <div class="float-left w-[200px] bg-red-500 -ml-[100%] relative -left-[200px]">左边</div>
      <div class="float-left w-[200px] bg-blue-500 -ml-[200px] relative left-[200px]">右边</div>
    </main>
    <hr class="py-8">
    <h1>flex布局-两侧固定200px，中间自适应最小50px，屏幕宽度不够时出现滚动条</h1>
    <main class="flex flex-row">
      <div class="flex-none w-[200px] bg-red-500">左边</div>
      <div class="flex-auto min-w-[50px] bg-yellow-500">中间</div>
      <div class="flex-none w-[200px] bg-blue-500">右边</div>
    </main>
  </div>
</template>
