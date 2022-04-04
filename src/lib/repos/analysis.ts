import { db } from '../db'

// TODO: add types to result
export const saveResult = async ({
  ref,
  source,
  result,
  schemaVersion,
}: {
  ref: string
  source: string
  result: any
  schemaVersion: string
}) => {
  const resultDbEntry = await db.analysisResult.create({
    data: {
      ref,
      source,
      rawJson: result,
      schemaVersion,
    },
  })

  return { refId: resultDbEntry.ref, dbResult: resultDbEntry }
}
