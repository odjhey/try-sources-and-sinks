import {
  activityExtractAndSaveRaw,
  activityAnalyzeFile,
  activityValidateDeliverySchema,
} from "./activities";
import { WorkflowExtractRawToDb } from "./workflow";

const runLocal: typeof WorkflowExtractRawToDb = async ({
  bucket,
  filePath,
}) => {
  const savedItemsSink = await activityExtractAndSaveRaw({
    source: {
      as: "source",
      type: "file",
      info: {
        bucket,
        filePath,
        mimeType: "",
      },
      ref: `${bucket}\\${filePath}`, // TODO: make unique
    },
    sink: {
      as: "sink",
      type: "db",
      info: { db: "", table: "" },
      ref: "", // TODO: REVISIT
    },
  });

  const validate = await activityValidateDeliverySchema({
    source: { ...savedItemsSink, as: "source" },
    sink: {
      as: "sink",
      type: "db",
      info: { db: "", table: "" },
      ref: "", // TODO: REVISIT
    },
  });

  console.log(validate);
};

(() => {
  runLocal({
    bucket: "bucket123",
    filePath: "file123-for-deliveries",
  });
})();
