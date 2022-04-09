import { process, processCanError } from "../lib/functions/generic-process";
import { TActivityPipe, TErrorableActivityPipe } from "../types/core";
import { Delivery as DeliveryParser } from "../lib/parsers";

/*
source
  type: "db"/"file"
  db -> info: { dbname, table, id }
  file -> info: { bucket, filePath }
*/

export const activityExtractAndSaveRaw: TActivityPipe<
  "file",
  "db",
  any
> = async ({ source, options, target }) => {
  return process({ source, options, target }, async ({ content, stat }) => {
    // source content

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

export const activityParseDelivery: TErrorableActivityPipe<
  "db",
  "db",
  "db"
> = async ({ source, target, options }) => {
  return processCanError({ source, options, target }, async ({ content }) => {
    const parseResult = content.resultDbEntry.map((d) =>
      DeliveryParser.parse(d.data)
    );

    // console.log(parseResult, "parseResult");

    return {
      operation: {
        operation: "PARSE_DELIVERY",
        operationInfo: {},
      },
      source,
      target,
      items: parseResult,
    };
  });
};
