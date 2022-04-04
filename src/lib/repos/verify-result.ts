import { db } from '../db'
import { nanoid } from 'nanoid'

export const saveResultMultiple = async ({
  results,
}: {
  results: { ok: boolean; input: any; error?: any; data?: any }[]
}) => {
  const refId = nanoid()
  const resultDbEntry = await db.parseResult.createMany({
    data: results.map((r) => ({
      ref: refId,
      input: r.input,
      ok: r.ok,
      result: r.ok ? r.data : r.error,
    })),
  })

  return { refId, dbResult: resultDbEntry }
}
