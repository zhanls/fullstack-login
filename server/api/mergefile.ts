import type { IncomingMessage, ServerResponse } from 'http'

import config from '#config'
import { useBody } from 'h3'
import path from 'path'
import { createReadStream, createWriteStream, unlinkSync, readdirSync, rmdirSync, readFileSync } from 'fs'
import { Writable } from 'stream'

const mergeFiles = (body) => {
  const fileDir = path.resolve(config.UPLOAD_DIR, body.chunkhash)
  const files = readdirSync(fileDir).sort()
  const targetPath = path.resolve(config.UPLOAD_DIR, `${body.chunkhash}.${body.ext}`)
  const fileWriteStream = createWriteStream(targetPath)
  // 
  const fileMergeRecursive = (files : string[], fileWriteStream : Writable) => {
    if (!files.length) {
      fileWriteStream.end("console.log('Stream 合并完成')")
      rmdirSync(fileDir) // 删除创建的文件夹
      return
    }
    const currentFile = path.resolve(fileDir, files.shift())
    const currentReadStream = createReadStream(currentFile)
    currentReadStream.pipe(fileWriteStream, { end: false })
    currentReadStream.on('end', () => {
      unlinkSync(currentFile)
      fileMergeRecursive(files, fileWriteStream)
    })
    currentReadStream.on('error', error => {
      console.log("🚀 ~ fileMergeRecursive ~ error", error)
      fileWriteStream.end()
    })
  }
  fileMergeRecursive(files, fileWriteStream)
}

const mergeFiles1 = body => {
  let len = 0
  const chunkDir = path.resolve(config.UPLOAD_DIR, body.chunkhash)
  const bufferList = readdirSync(chunkDir).map((chunk, i) => {
    const chunkPath = path.resolve(chunkDir, chunk)
    const buffer = readFileSync(chunkPath)
    len += buffer.length
    return buffer
  })
  // merge files
  const buffer = Buffer.concat(bufferList, len)
  const destPath = path.resolve(config.UPLOAD_DIR, `${body.chunkhash}.${body.ext}`)
  const ws = createWriteStream(destPath)
  ws.write(buffer)
  ws.close()
}

export default async (req: IncomingMessage, res: ServerResponse) => {
  const body = await useBody(req)
  mergeFiles(body)
  // mergeFiles1(body)
  res.writeHead(200)
    .end('文件合并成功')
}