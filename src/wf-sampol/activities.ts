import { analyzeRawFrame } from "../lib/analyzers";
import {
  getClient,
  getFileAsStream,
  getFileStat,
} from "../lib/object-store-client";
import { readSourceTypeDb } from "../lib/functions/readers";
import * as SinkRepo from "../lib/repos/sink";
import * as Parsers from "../lib/parsers";
import { TErrorableActivityPipe, TActivityPipe } from "../types/core";
import { serializeStream } from "../lib/functions/serializeStream";

// TODO: continue later

export const activityAnalyzeFile: TActivityPipe<"file", "db"> = async ({
  source,
  options,
  target,
}) => {
  // TODO: add a decent logger
  const { content, stat } = await readFile(source.info);
  const analysis = await analyzeRawFrame(content as any[]);

  const { id } = await SinkRepo.saveHeader({
    target,
    source: { ...source, id: `${source.info.bucket}/${source.info.filePath}` },
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
    info: { db: "", table: "", id, count },
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

export const activityExtractAndSaveRaw: TActivityPipe<"file", "db"> = async ({
  source,
  options,
  target,
}) => {
  // TODO: add a decent logger

  const { content } = await readFile(source.info);

  const { id } = await SinkRepo.saveHeader({
    target: { type: target.type, info: target.info },
    source: { ...source, id: `${source.info.bucket}/${source.info.filePath}` },
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

  return { info: { id, count }, type: "db" };
};

export const activityValidateDeliverySchema: TErrorableActivityPipe<
  "db",
  "db",
  "db"
> = async ({ source, options, target }) => {
  // TODO: add a decent logger

  const sourceContent = await readSourceTypeDb({ headerId: source.info.id }, [
    { prio: 99, name: "BUILTINS_OK" },
  ]);

  const parseResult = sourceContent.resultDbEntry.map((c) =>
    Parsers.Delivery.parse(c.data)
  );

  const { id } = await SinkRepo.saveHeader({
    target,
    source: { ...source, id: source.info.id },
    operation: {
      operation: "PARSE_DELIVERY",
      operationInfo: {},
    },
  });

  const { count: _count } = await SinkRepo.saveItems({
    headerId: id,
    items: parseResult,
  });

  const hasError = parseResult.some((item) => {
    return !item.ok;
  });
  const hasOk = parseResult.some((item) => {
    return item.ok;
  });

  return {
    runInfo: { hasError, hasOk },
    errorSink: { info: { id }, type: "db" },
    okSink: { info: { id }, refId: id, type: "db" },
  };
};
