import { activityExtractAndSaveRaw, activityParseDelivery } from "./activities";
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

  const stage2sink = await activityParseDelivery({
    source: savedItemsSink,
    target: { type: "db" },
  });

  /*
  const validate3 = await activityValidateDeliveryAgainstDeps({
    source: validateSink.okSink,
    target: {
      type: "db",
    },
  });
  */
};

(() => {
  runLocal({
    bucket: "bucket123",
    filePath: "file-deliveries-4only.csv",
  });
})();
