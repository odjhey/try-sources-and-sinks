import { db } from '../db'

export const saveResult = async ({
  wfId,
  result,
}: {
  wfId: string
  result: any
}) => {
  const resultDbEntry = await db.workflowRunResult.create({
    data: {
      temporalWorkflowId: wfId,
      result,
    },
  })

  console.log('wfId', wfId)
  await db.workflowRun.update({
    where: { temporalWorkflowId: wfId },
    data: { resultId: resultDbEntry.id },
  })

  return resultDbEntry
}
