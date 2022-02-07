import type { IncomingMessage, ServerResponse } from 'http'
// import { useBody } from 'h3'
import busboy from 'busboy'
import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'

const parseMultipart = (req: IncomingMessage, res: ServerResponse) => new Promise<boolean>((resolve, reject) => {
  const bb = busboy({ headers: req.headers })
  let filename: string;
  bb.on('field', (name, val, info) => {
    console.log(`Field [${name}]: value: %j`, val)
    if (name === 'name') {
      filename = val
    }
  })
  bb.on('file', (name, stream: Readable, info) => {
    // const { filename, encoding, mimeType } = info;
    // console.log(
    //   `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
    //   filename,
    //   encoding,
    //   mimeType
    // )
    const saveTo = path.resolve(`./public/${filename}`)
    console.log("🚀 ~ file: uploadfile.ts ~ line 27 ~ bb.on ~ saveTo", saveTo)
    // 将文件存放到/public目录下，注意此处必须消费掉stream, 可使用stream.resume()
    stream.pipe(fs.createWriteStream(saveTo))
  })
  bb.on('close', () => {
    console.log('Done parsing form!')
    resolve(true)
  })
  req.pipe(bb)
})

export default async (req: IncomingMessage, res: ServerResponse) => {
  // const body = await useBody(req) // only for POST request
  // console.log("🚀 ~ file: uploadfile.ts ~ line 6 ~ body", body)
  if (req.method === 'POST') {
    console.log('POST request')
    const finished = await parseMultipart(req, res)
    if (finished) {
      res.writeHead(200, { 'Connection': 'close' })
      res.end()
    }
    return
  }
  res.writeHead(404)
  res.end()
}