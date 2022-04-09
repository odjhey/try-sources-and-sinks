import { analyzeRawFrame } from "../lib/analyzers";
import * as Parsers from "../lib/parsers";
import { TErrorableActivityPipe, TActivityPipe } from "../types/core";
import { process, processCanError } from "../lib/functions/generic-process";
import { pipeline } from "../lib/functions/pipeline";
import { TParseResult } from "../types/util";
import { SinkItem } from "@prisma/client";

// TODO: continue later
// TODO: add a decent logger

export const activityAnalyzeFile: TActivityPipe<"file", "db", any> = async ({
  source,
  options,
  target,
}) => {
  return process({ source, options, target }, async ({ content, stat }) => {
    const analysis = await analyzeRawFrame(content as any[]);

    return {
      target,
      source,
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

export const activityExtractAndSaveRaw: TActivityPipe<
  "file",
  "db",
  any
> = async ({ source, options, target }) => {
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
      // -- your thing here
      const parseResult = content.resultDbEntry.map((c) =>
        pipeline<SinkItem["data"], TParseResult<any, any, any>>(
          [
            Parsers.Delivery.parse,
            (d) => {
              if (d && typeof d === "object" && "ok" in d && d.ok === true) {
                if (d.data.ShipmentNumber === 10000048) {
                  return {
                    ok: false,
                    error: { message: "something wrong" },
                    input: d.input,
                  };
                }
              }

              // error
              return d;
            },
          ],
          c.data
        )
      );

      // console.log(parseResult);

      return {
        target,
        source: {
          ...source,
          id: source.info.id,
        },
        operation: {
          operation: "PARSE_DELIVERYX21",
          operationInfo: {},
        },

        items: parseResult,
      };
    }
  );
};

export const activityValidateDeliveryAgainstDeps: TErrorableActivityPipe<
  "db",
  "db",
  "db"
> = async ({ source, options, target }) => {
  // TODO: add a decent logger

  return processCanError(
    { source, options, target, skipWriteToSink: true },
    async ({ content, stat }) => {
      /*
      console.log(
        JSON.stringify(
          content.resultDbEntry.map((r) => r.data),
          null,
          2
        ),
        "content---"
      );
      */

      const count = content.resultDbEntry.reduce(
        (accu, item) => {
          if (item.ok === true) return { ...accu, pass: accu.pass + 1 };
          return { ...accu, error: accu.error + 1 };
        },
        { error: 0, pass: 0 }
      );

      console.log("count", count);

      return {
        target,
        source: {
          ...source,
          id: source.info.id,
        },
        operation: {
          operation: "PARSE_DELIVERY",
          operationInfo: {},
        },

        items: [],
      };
    }
  );
};
