import { analyzeRawFrame } from "../lib/analyzers";
import {
  getClient,
  getFileAsStream,
  getFileStat,
} from "../lib/object-store-client";
import { readSourceTypeDb, serializeStream } from "../lib/readers";
import * as SinkRepo from "../lib/repos/sink";
import * as Parsers from "../lib/parsers";
import { TActivityPipe } from "../types/core";

// TODO: continue later

export const activityAnalyzeFile: TActivityPipe<"file", "db", "db"> = async ({
  source,
  options,
  target,
}) => {
  // TODO: add a decent logger
  const { content, stat } = await readFile(source.info);
  const analysis = await analyzeRawFrame(content as any[]);

  const { id } = await SinkRepo.saveHeader({
    target,
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
    type: "db",
    info: { db: "", table: "", count },
    refId: id,
  };
};

const readFile = async (fileInfo: { bucket: string; filePath: string }) => {
  const { bucket, filePath } = fileInfo;
  const readable = await getFileAsStream(getClient(), { bucket, filePath });

  // TODO: if (["csv", "excel"]source.info.mimeType)
  const content = await serializeStream(readable);
  const stat = await getFileStat(getClient(), { bucket, filePath });

  return { content, stat };
};

export const activityExtractAndSaveRaw: TActivityPipe<
  "file",
  "db",
  "db"
> = async ({ source, options, target }) => {
  // TODO: add a decent logger

  const { content } = await readFile(source.info);

  const { id } = await SinkRepo.saveHeader({
    target: { type: target.type, info: target.info },
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
    type: "db",
    info: { db: "", table: "", count },
    refId: id,
  };
};

export const activityValidateDeliverySchema: TActivityPipe<
  "db",
  "db",
  "db"
> = async ({ source, options, target }) => {
  // TODO: add a decent logger

  const sourceContent = await readSourceTypeDb({
    ref: source.refId,
    info: { db: "", table: "" },
    filters: [],
  });

  const parseResult = sourceContent.resultDbEntry.map((c) =>
    Parsers.Delivery.parse(c.result)
  );

  const { id } = await SinkRepo.saveHeader({
    target,
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
    type: "db",
    info: { db: "", table: "", count },
    refId: id,
  };
};

// input -> logic -> save -> result saveId
