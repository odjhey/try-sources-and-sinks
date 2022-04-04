import { db } from '../db'

export const save = async ({
  refId,
  summary,
}: {
  refId: string
  summary: any
}) => {
  const resultDbEntry = await db.stepSummary.create({
    data: {
      ref: refId,
      summary,
    },
  })

  return { refId, dbResult: resultDbEntry }
}
