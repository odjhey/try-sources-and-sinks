import { analyzeRawFrame } from "../lib/analyzers";
import {
  getClient,
  getFileAsStream,
  getFileStat,
} from "../lib/object-store-client";
import { readSourceTypeDb, serializeStream } from "../lib/readers";
import * as SinkRepo from "../lib/repos/sink";
import * as Parsers from "../lib/parsers";

/*
  sourceType: file, sourceRef: asdlfkj, sourceInfo: { bucket, path },
  sinkType: db, sinkRef: id, sinkInfo: {dbName: etc}
  operation: READ_FILE, operationInfo: {version: ''}
*/

type TSourceSinkDefinition<
  A extends "source" | "sink",
  T extends "file" | "db"
> = {
  as: A;
  type: T;
  ref: string;
  info: T extends "file"
    ? { bucket: string; filePath: string; mimeType: string }
    : { db: string; table: string } & Record<string, any>;
};

// TODO: continue later
export async function activityAnalyzeFile({
  source,
  sink,
}: {
  source: TSourceSinkDefinition<"source", "file">;
  sink: TSourceSinkDefinition<"sink", "db">;
}): Promise<any> {
  // TODO: add a decent logger

  const { content, stat } = await readFile(source);
  const analysis = await analyzeRawFrame(content as any[]);

  const { id } = await SinkRepo.saveHeader({
    sink,
    source,
    operation: {
      operation: "ANALYZE_FILE",
      operationInfo: {},
    },
  });

  const { count } = await SinkRepo.saveItems({
    headerId: id,
    items: [
      {
        input: "",
        ok: true,
        data: { schemaVersion: "0.0.0", analysis, stat },
      },
    ],
  });

  return {
    as: "sink",
    type: "db",
    info: { db: "", table: "", count },
    ref: id,
  };
}

const readFile = async (source: TSourceSinkDefinition<"source", "file">) => {
  const { bucket, filePath } = source.info;
  const readable = await getFileAsStream(getClient(), { bucket, filePath });

  // TODO: if (["csv", "excel"]source.info.mimeType)
  const content = await serializeStream(readable);
  const stat = await getFileStat(getClient(), { bucket, filePath });

  return { content, stat };
};

export async function activityExtractAndSaveRaw({
  source,
  sink,
}: {
  source: TSourceSinkDefinition<"source", "file">;
  sink: TSourceSinkDefinition<"sink", "db">;
}): Promise<TSourceSinkDefinition<"sink", "db">> {
  // TODO: add a decent logger

  const { content } = await readFile(source);

  const { id } = await SinkRepo.saveHeader({
    sink,
    source,
    operation: {
      operation: "EXTRACT_AND_SAVE_RAW",
      operationInfo: {},
    },
  });

  const { count } = await SinkRepo.saveItems({
    headerId: id,
    items: (content as any[]).map((item) => ({
      input: "",
      ok: true,
      data: item,
    })),
  });

  return {
    as: "sink",
    type: "db",
    info: { db: "", table: "", count },
    ref: id,
  };
}

export async function activityValidateDeliverySchema({
  source,
  sink,
}: {
  source: TSourceSinkDefinition<"source", "db">;
  sink: TSourceSinkDefinition<"sink", "db">;
}): Promise<TSourceSinkDefinition<"sink", "db">> {
  // TODO: add a decent logger

  const sourceContent = await readSourceTypeDb({
    ref: source.ref,
    info: { db: "", table: "" },
    filters: [],
  });

  const parseResult = sourceContent.resultDbEntry.map((c) =>
    Parsers.Delivery.parse(c.result)
  );

  const { id } = await SinkRepo.saveHeader({
    sink,
    source,
    operation: {
      operation: "PARSE_DELIVERY",
      operationInfo: {},
    },
  });

  const { count } = await SinkRepo.saveItems({
    headerId: id,
    items: parseResult,
  });

  return {
    as: "sink",
    type: "db",
    info: { db: "", table: "", count },
    ref: id,
  };
}

// input -> logic -> save -> result saveId
