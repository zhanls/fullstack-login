import type { IncomingMessage, ServerResponse } from 'http'

// 计算API响应耗时的中间件
export default async (req: IncomingMessage, res: ServerResponse, next) => {
  // 记录开始时间
  const start = Date.now()
  // 让内层中间件得到执行
  await next()
  // 记录结束的时间
  const end = Date.now()
  // 设置响应头 X-Response-Time
  const duration = `${end - start}ms`
  // ctx.set 设置响应头
  res.setHeader('X-Response-Time', duration)
}
