import type { IncomingMessage, ServerResponse } from 'http'

import config from '#config'
import { useBody } from 'h3'
import path from 'path'
import { createReadStream, createWriteStream, unlinkSync, readdirSync } from 'fs'

const mergeFiles = (dir, files, size) => new Promise(resolve => {
  // 每个chunk文件路径组成的数组
  files.forEach((file, i) => {
    const filePath = path.resolve(dir, file)
    const writeStream = createWriteStream(filePath, {
      start: i * size,
    })
    const readStream = createReadStream(filePath)
    readStream.on('end', () => {
      unlinkSync(filePath)
      resolve(true)
    })
    readStream.pipe(writeStream)
  })
})

export default async (req: IncomingMessage, res: ServerResponse) => {
  const body = await useBody(req)
  // ./public/${hash}.${ext}
  const previousChunkDir = path.resolve(config.UPLOAD_DIR, body.chunkhash)
  // ./public/upload/下对应${hash}-${index}的文件们
  const files = readdirSync(previousChunkDir)
  const finished = await mergeFiles(previousChunkDir, files, body.chunksize)
  if (finished) {
    res.writeHead(200, { 'Connection': 'close' })
    res.end()
  }
}