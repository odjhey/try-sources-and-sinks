import {
  activityExtractAndSaveRaw,
  activityAnalyzeFile,
  activityValidateDeliverySchema,
} from "./activities";
import { WorkflowExtractRawToDb } from "./workflow";

/*
pipe: ( source, options ) => {info: {hasOk, hasError}, ok: sink, error: sink}
*/

const runLocal: typeof WorkflowExtractRawToDb = async ({
  bucket,
  filePath,
}) => {
  const savedItemsSink = await activityExtractAndSaveRaw({
    source: {
      type: "file",
      info: {
        bucket,
        filePath,
      },
      refId: `${bucket}\\${filePath}`, // TODO: make unique
    },
    target: {
      type: "db",
      info: { db: "", table: "" },
    },
    options: {},
  });

  const validate = await activityValidateDeliverySchema({
    source: { ...savedItemsSink },
    target: {
      type: "db",
      info: { db: "", table: "" },
    },
    options: {},
  });

  console.log(validate);
};

(() => {
  runLocal({
    bucket: "bucket123",
    filePath: "file123-for-deliveries",
  });
})();
