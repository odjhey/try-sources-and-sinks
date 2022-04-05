import {
  activityExtractAndSaveRaw,
  activityAnalyzeFile,
  activityValidateDeliverySchema,
  activityTestRead,
} from "./activities";
import { WorkflowExtractRawToDb } from "./workflow";

/*
pipe: ( source, options ) => {info: {hasOk, hasError}, ok: sink, error: sink}
*/

const runLocal: typeof WorkflowExtractRawToDb = async ({
  bucket,
  filePath,
}) => {
  /*
  const savedItemsSink = await activityExtractAndSaveRaw({
    source: {
      type: "file",
      info: {
        bucket,
        filePath,
      },
    },
    target: {
      type: "db",
    },
  });

  console.log("savedItems", savedItemsSink);

  const validate = await activityValidateDeliverySchema({
    source: savedItemsSink,
    target: {
      type: "db",
    },
  });

  console.log("validation result", validate);
  */

  await activityTestRead({
    source: {
      type: "db",
      info: {
        id: "uvm7XUXbdJYaInDYsrXzN",
      },
    },
    target: {
      type: "db",
    },
  });
};

(() => {
  runLocal({
    bucket: "bucket123",
    filePath: "file123-for-deliveries",
  });
})();
