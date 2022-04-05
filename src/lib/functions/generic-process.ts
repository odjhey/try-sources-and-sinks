import { TContainerTypes } from "../../types/core";
import * as SinkRepo from "../repos/sink";
import { readFile } from "./read-file";
import { readSourceTypeDb } from "./readers";

type TDefinition = {
  source: any;
  options: any;
  target: any;
  skipWrite?: boolean;
};
type TBodyFnReturn = Promise<{
  target: any;
  source: any;
  operation: any;
  items: any;
}>;

type TBodyFn = (args: { content: any; stat: any }) => TBodyFnReturn;

const processBase = async <O extends TContainerTypes>(
  { source, options, target, skipWrite = false }: TDefinition,
  fn: TBodyFn
): Promise<{
  result: any;
  stat: any;
  id: any;
  count: any;
}> => {
  const { content, stat } = await readSource(source);

  const result = await fn({ content, stat });

  if (skipWrite) {
    return { result, stat, id: "", count: result.items.length };
  }

  const { id } = await SinkRepo.saveHeader({
    target: result.target,
    source: result.source,
    operation: result.operation,
  });

  const { count } = await SinkRepo.saveItems({
    headerId: id,
    items: result.items,
  });

  return { result, stat, id, count };
};

export const process = async <O extends TContainerTypes>(
  { source, options, target }: TDefinition,
  fn: TBodyFn
): Promise<{
  type: O;
  info: { id: string } & Record<string, any>;
}> => {
  const { result, count, id, stat } = await processBase(
    { source, options, target },
    fn
  );

  return {
    type: target.type,
    info: { id, count },
  };
};

const readSource = async (source: any) => {
  if (source.type === "db") {
    return readFromDb(source);
  }
  if (source.type === "file") {
    return readBucket(source);
  }

  throw new Error(`Source Type ${source.type} Not Supported.`);
};

const readBucket = (source: any) => readFile(source.info);
const readFromDb = async (source: any) => {
  const content = await readSourceTypeDb({ headerId: source.info.id }, [
    { prio: 99, name: "BUILTINS_OK" },
  ]);

  return { content, stat: {} };
};

// TODO: fix target of error
export const processCanError = async <
  O extends TContainerTypes,
  E extends TContainerTypes
>(
  { source, options, target }: TDefinition,
  fn: TBodyFn
): Promise<{
  runInfo: { hasError: boolean; hasOk: boolean };
  errorSink: { info: { id: string }; type: E };
  okSink: { info: { id: string }; type: O };
}> => {
  const { result, count, id, stat } = await processBase(
    { source, options, target },
    fn
  );

  const hasError = result.items.some((item: any) => {
    return !item.ok;
  });
  const hasOk = result.items.some((item: any) => {
    return item.ok;
  });

  return {
    runInfo: { hasError, hasOk },
    errorSink: { info: { id }, type: target.type },
    okSink: { info: { id }, type: target.type },
  };
};
