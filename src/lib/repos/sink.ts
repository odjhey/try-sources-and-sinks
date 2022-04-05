import { db } from "../db";
import { nanoid } from "nanoid";

export const saveHeader = async ({
  target,
  source,
  operation: { operation, operationInfo },
}: {
  target: { type: string; info?: any };
  source: { type: string; id: string; info: any };
  operation: {
    operation: string;
    operationInfo: Record<string, any>;
  };
}) => {
  const refId = nanoid();
  const resultDbEntry = await db.sinkHeader.create({
    data: {
      id: refId,
      sinkType: target.type,
      sinkInfo: target.info || {},

      sourceType: source.type,
      sourceId: source.id,
      sourceInfo: source.info,

      operation: operation,
      operationInfo: operationInfo,
    },
  });

  return { id: resultDbEntry.id, dbResult: resultDbEntry };
};

export const saveItems = async ({
  headerId,
  items,
}: {
  headerId: string;
  items: { input: any; ok: boolean; data?: any; error?: any }[];
}) => {
  const resultDbEntry = await db.sinkItem.createMany({
    data: items.map((item) => ({
      headerId,
      input: item.input,
      ok: item.ok,
      data: item.ok ? item.data : item.error,
    })),
  });

  return { count: resultDbEntry.count };
};

// TODO: see if need ihiwalay ang read and write
export const getItems = async ({
  headerId,
  ok,
}: {
  headerId: string;
  ok?: boolean;
}) => {
  if (ok === undefined) {
    const resultDbEntry = await db.sinkItem.findMany({
      where: { headerId: headerId },
    });

    return { refId: headerId, resultDbEntry };
  }

  const resultDbEntry = await db.sinkItem.findMany({
    where: { headerId: headerId, ok },
  });

  return { refId: headerId, resultDbEntry };
};
