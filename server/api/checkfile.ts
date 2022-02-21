import type { IncomingMessage, ServerResponse } from 'http'

import { useBody } from 'h3'
import path from 'path'
import config from '#config'
import { readdirSync, existsSync } from 'fs'

export default async (req: IncomingMessage, res: ServerResponse) => {
  const body = await useBody(req)
  const filePath = path.resolve(config.UPLOAD_DIR, `${body.chunkhash}.${body.ext}`)
  let uploaded = false
  let uploadedList = []
  if (existsSync(filePath)) { // 文件存在
    uploaded = true
  } else {
    const fileDir = path.resolve(config.UPLOAD_DIR, body.chunkhash)
    if (existsSync(fileDir)) {
      uploadedList = readdirSync(fileDir) // 读取对应dir下的文件列表
    }
    console.log("🚀 ~ file: checkfile.ts ~ line 17 ~ uploadedList", uploadedList)
  }
  res.writeHead(200)
    .end(JSON.stringify({
      uploaded,
      uploadedList
    }))
}