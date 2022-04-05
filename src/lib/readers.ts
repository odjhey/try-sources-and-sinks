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

export const readSourceTypeDb = async (
  where: { headerId: string },
  filters: { prio: number; name: string }[]
) => {
  // const builtins

  const hasBuiltInOkOnly = filters.find((f) => f.name === "BUILTINS_OK");
  const hasBuiltInErrorOnly = filters.find((f) => f.name === "BUILTINS_ERROR");

  if (hasBuiltInOkOnly) {
    return SinkRepo.getItems({ headerId: where.headerId, ok: true });
  }
  if (hasBuiltInErrorOnly) {
    return SinkRepo.getItems({ headerId: where.headerId, ok: false });
  }
  return SinkRepo.getItems({ headerId: where.headerId });
};
