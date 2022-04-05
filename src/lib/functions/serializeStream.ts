import * as XLSX from "xlsx";
import { Readable } from "stream";

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
