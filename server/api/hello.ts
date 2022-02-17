import type { IncomingMessage, ServerResponse } from 'http'
import { useBody, useCookies, useQuery } from 'h3'
import config from '#config'

export default async (req: IncomingMessage, res: ServerResponse) => {
  const query = useQuery(req)
  // const body = await useBody(req) // only for POST request
  const cookies = useCookies(req)
  console.log("🚀 ~ file: hello.ts ~ line 4 ~ config", config)
  return { query, cookies, test: config.UPLOAD_DIR }
}