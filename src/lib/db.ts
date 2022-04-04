import { PrismaClient } from '@prisma/client'

/*
 * Instance of the Prisma Client
 */
export const db = new PrismaClient({
  // log: emitLogLevels(['info', 'warn', 'error']),
})

/*
handlePrismaLogging({
  db,
  logger,
  logLevels: ['info', 'warn', 'error'],
})
*/
