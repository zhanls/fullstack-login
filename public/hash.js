// 引入spark-md5
self.importScripts('spark-md5.min.js')

self.onmessage = e => {
  const { blobs } = e.data
  const spark = new self.SparkMD5.ArrayBuffer()

  let progress = 0
  const step = Number(100 / blobs.length)

  const appendToSpark = p => {
    const reader = new FileReader()
    reader.readAsArrayBuffer(p.shift())
    reader.onload = e => {
      spark.append(e.target.result)
      // 如果计算完毕
      if (!p.length) {
        self.postMessage({
          progress: 100,
          hash: spark.end()
        })
      } else {
        progress += step
        self.postMessage({
          progress: Number(progress.toFixed(2))
        })
        appendToSpark(p)
      }
    }
  }

  appendToSpark(blobs)
}