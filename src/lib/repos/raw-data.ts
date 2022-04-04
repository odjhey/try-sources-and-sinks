import { db } from '../db'
import { nanoid } from 'nanoid'

export const saveResult = async ({ result }: { result: any }) => {
  const resultDbEntry = await db.rawData.create({
    data: {
      ref: 'someref',
      rawJson: result,
    },
  })

  return resultDbEntry
}

export const saveResultMultiple = async ({ results }: { results: any[] }) => {
  const refId = nanoid()
  const resultDbEntry = await db.rawData.createMany({
    data: results.map((r) => ({ ref: refId, rawJson: r })),
  })

  return { refId, dbResult: resultDbEntry }
}

export const get = async ({ rawRefId }: { rawRefId: string }) => {
  return db.rawData.findMany({ where: { ref: rawRefId } })
}
