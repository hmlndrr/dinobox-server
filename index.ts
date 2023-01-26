import { serve } from 'https://deno.land/std/http/server.ts'

const forbidden = [
  'flag',
  'index',
  'readfile',
  'post',
  'ls',
  'cat',
  'etc',
  'rce',
  'rse',
  'exec',
  'put',
  'btoa',
  'atob',
  'body',
  'patch',
  'delete',
  'head',
  'get',
  'fetch',
  '[',
  ']',
  '/',
]

function spotForbiddenWords(text: string, kind: string) {
  for (const word of forbidden) {
    if (text.toString().toLowerCase().includes(word)) {
      throw new Error('Your ' + kind + ' contains forbidden word')
    }
  }
}

function spotLargePayload(text: string, max: number) {
  if (text.length > max) throw new Error('Too much content to return')
}


async function execute(code: string) {
  try {
    spotLargePayload(code, 250)
    spotForbiddenWords(code, 'Code')
    const output = await eval(code)
    spotForbiddenWords(output, 'Output')
    spotLargePayload(output.toString(), 32)
    return output.toString()
  } catch (e) {
    if (e instanceof Deno.errors.PermissionDenied) {
      return 'You have no rights to do that'
    }
    return e.message
  }
}

async function handler(req: Request) {
  const code = await req.text()
  const output = await execute(code)
  const res = new Response(output, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
  return res
}

serve(handler, {
  port: 8000,
})

console.log('running')
