import { z } from 'zod'
import type { TParseResult } from '../../../types/util'

const zNumberOrString = () => z.string().or(z.number())

export const parse = (input: any): TParseResult<any, any, any> => {
  const schema = z.object({
    Delivery: zNumberOrString(),
  })

  const result = schema.safeParse(input)
  if (result.success) {
    return { ok: true, data: result.data, input }
  }

  return { ok: false, error: result.error.flatten(), input }
}
