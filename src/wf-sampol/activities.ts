import { analyzeRawFrame } from "../lib/analyzers";
import { readSourceTypeDb } from "../lib/functions/readers";
import * as SinkRepo from "../lib/repos/sink";
import * as Parsers from "../lib/parsers";
import { TErrorableActivityPipe, TActivityPipe } from "../types/core";
import { process, processCanError } from "../lib/functions/generic-process";

// TODO: continue later
// TODO: add a decent logger

export const activityAnalyzeFile: TActivityPipe<"file", "db"> = async ({
  source,
  options,
  target,
}) => {
  return process({ source, options, target }, async ({ content, stat }) => {
    const analysis = await analyzeRawFrame(content as any[]);

    return {
      target,
      source: {
        ...source,
        id: `${source.info.bucket}/${source.info.filePath}`,
      },
      operation: {
        operation: "ANALYZE_FILE",
        operationInfo: {},
      },
      items: [
        {
          input: "",
          ok: true,
          data: { schemaVersion: "0.0.0", analysis, stat },
        },
      ],
    };
  });
};

export const activityExtractAndSaveRaw: TActivityPipe<"file", "db"> = async ({
  source,
  options,
  target,
}) => {
  return process({ source, options, target }, async ({ content, stat }) => {
    return {
      target,
      source,
      operation: {
        operation: "EXTRACT_AND_SAVE_RAW",
        operationInfo: {},
      },

      items: (content as any[]).map((item) => ({
        input: "",
        ok: true,
        data: item,
      })),
    };
  });
};

export const activityValidateDeliverySchema: TErrorableActivityPipe<
  "db",
  "db",
  "db"
> = async ({ source, options, target }) => {
  // TODO: add a decent logger

  return processCanError(
    { source, options, target },
    async ({ content, stat }) => {
      const parseResult = content.resultDbEntry.map((c: any) =>
        Parsers.Delivery.parse(c.data)
      );

      return {
        canError: true,
        target,
        source: {
          ...source,
          id: source.info.id,
        },
        operation: {
          operation: "PARSE_DELIVERY",
          operationInfo: {},
        },

        items: parseResult,
      };
    }
  );
};
