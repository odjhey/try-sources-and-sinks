import { db } from "../db";
import { nanoid } from "nanoid";

type TSourceSinkDefinition<
  A extends "source" | "sink",
  T extends "file" | "db"
> = {
  as: A;
  type: T;
  ref: string;
  info: T extends "file"
    ? { bucket: string; filePath: string; mimeType: string }
    : { db: string; table: string };
};

export const saveHeader = async ({
  sink,
  source,
  operation: { operation, operationInfo },
}: {
  sink: TSourceSinkDefinition<any, any>;
  source: TSourceSinkDefinition<any, any>;
  operation: {
    operation: string;
    operationInfo: Record<string, any>;
  };
}) => {
  const sinkRef = sink.ref ? sink.ref : nanoid();
  const resultDbEntry = await db.sinkHeader.create({
    data: {
      id: sinkRef,
      sinkType: sink.type,
      sinkRef: sinkRef,
      sinkInfo: sink.info,

      sourceType: source.type,
      sourceRef: source.ref,
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
      result: item.ok ? item.data : item.error,
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
