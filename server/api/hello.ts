import type { IncomingMessage, ServerResponse } from 'http'
import { useBody, useCookies, useQuery } from 'h3'

export default async (req: IncomingMessage, res: ServerResponse) => {
  const query = useQuery(req)
  // const body = await useBody(req) // only for POST request
  const cookies = useCookies(req)
  return { query, cookies }
}