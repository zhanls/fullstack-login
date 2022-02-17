import type { IncomingMessage, ServerResponse } from 'http'

import config from '#config'
import busboy from 'busboy'
import { createWriteStream, existsSync, mkdirSync } from 'fs'
import path from 'path'
import { Readable } from 'stream'

interface fieldsType {
  chunkhash?: string;
  index?: string;
}

const asyncBusboy = (req: IncomingMessage) => new Promise<boolean>(resolve => {
  const bb = busboy({ headers: req.headers })
  const fields:fieldsType = {}
  bb.on('field', (key, value) => {
    console.log(`Field [${key}]: value: %j`, value)
    fields[key] = value
  }).on('file', (name, stream: Readable) => {
    const chunkDir = path.resolve(config.UPLOAD_DIR, fields.chunkhash)
    if (!existsSync(chunkDir)) {
      // 没有文件夹则先创建一个
      mkdirSync(chunkDir)
    }
    const saveTo = path.resolve(chunkDir, fields.index)
    console.log("🚀 ~ file: uploadfile.ts ~ line 27 ~ bb.on ~ saveTo", saveTo)
    // 将文件存放到/public目录下，注意此处必须消费掉stream, 可使用stream.resume()
    stream.pipe(createWriteStream(saveTo))
  }).on('close', () => {
    console.log('Done parsing form!')
    resolve(true)
  })
  req.pipe(bb)
})

export default async (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === 'POST') {
    const finished = await asyncBusboy(req)
    if (finished) {
      res.writeHead(200, { 'Connection': 'close' })
      res.end()
    }
    return
  }
  res.writeHead(404)
  res.end()
}