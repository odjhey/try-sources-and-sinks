import type { TParseResult } from '../../../types/util'

export const getSummary = (results: TParseResult<any, any, any>[]) => {
  const counts = results.reduce(
    (accu, item) => {
      return item.ok
        ? { pass: accu.pass + 1, fail: accu.fail }
        : { pass: accu.pass, fail: accu.fail + 1 }
    },
    { pass: 0, fail: 0 }
  )

  return {
    total: results.length,
    counts,
  }
}
