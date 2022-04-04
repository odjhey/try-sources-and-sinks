import * as XLSX from "xlsx";
import { Readable } from "stream";
import * as SinkRepo from "./repos/sink";

// TODO: see if need to change based on mime/file extension
export const serializeStream = async (readable: Readable) => {
  return await new Promise((resolve, reject) => {
    const buffers: any[] = [];

    readable.on("data", function (data) {
      buffers.push(data);
    });
    readable.on("error", (err) => {
      reject(err);
    });
    readable.on("end", function () {
      const buffer = Buffer.concat(buffers);
      const workbook = XLSX.read(buffer, { type: "buffer" });

      const jsa = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]]
      );

      resolve(jsa);
    });
  });
};

export const readSourceTypeDb = async (source: {
  ref: string;
  info: { db: string; table: string } & Record<string, any>;
  filters: { prio: number; name: string }[];
}) => {
  // const builtins

  const hasBuiltInOkOnly = source.filters.find((f) => f.name === "BUILTINS_OK");
  const hasBuiltInErrorOnly = source.filters.find(
    (f) => f.name === "BUILTINS_ERROR"
  );

  if (hasBuiltInOkOnly) {
    return SinkRepo.getItems({ headerId: source.ref, ok: true });
  }
  if (hasBuiltInErrorOnly) {
    return SinkRepo.getItems({ headerId: source.ref, ok: false });
  }
  return SinkRepo.getItems({ headerId: source.ref });
};
