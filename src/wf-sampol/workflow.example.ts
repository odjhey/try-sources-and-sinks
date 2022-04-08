import {
  activityExtractAndSaveRaw,
  activityValidateDeliverySchema,
  activityValidateDeliveryAgainstDeps,
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
    },
    target: {
      type: "db",
    },
  });

  const validateSink = await activityValidateDeliverySchema({
    source: savedItemsSink,
    target: {
      type: "db",
    },
  });
  console.log(validateSink);

  const validate3 = await activityValidateDeliveryAgainstDeps({
    source: validateSink.okSink,
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
