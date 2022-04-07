import { SinkItem } from "@prisma/client";
import { BucketItemStat } from "minio";
import { TContainerTypes, TSource, TTarget } from "../../types/core";
import * as SinkRepo from "../../repos/sink";
import { readFile } from "./read-file";
import { readSourceTypeDb } from "./readers";

type TDefinition<I extends TContainerTypes, O extends TContainerTypes> = {
  source: TSource<I>;
  options: any;
  target: TTarget<O>;
  skipWriteToSink?: boolean;
};

type TBodyFnReturn<T> = {
  target: TTarget<any>;
  source: TSource<any>;
  operation: any;
  items: T extends TBodyFnReturn<infer Return> ? Return : T;
};

type TBodyFn<I> = (args: {
  content: I extends "db"
    ? { refId: string; resultDbEntry: SinkItem[] }
    : unknown;
  stat: I extends "file" ? BucketItemStat : {};
}) => Promise<TBodyFnReturn<any>>;

const processBase = async <
  I extends TContainerTypes,
  O extends TContainerTypes
>(
  {
    source,
    options,
    target,
    skipWriteToSink: skipWrite = false,
  }: TDefinition<I, O>,
  fn: TBodyFn<any>
): Promise<{
  result: TBodyFnReturn<any>;
  stat: any;
  id: string;
  count: number;
}> => {
  const { content, stat } = await readSource<I>(source);

  const result = await fn({ content, stat });

  if (skipWrite) {
    return { result, stat, id: "", count: result.items.length };
  }

  const { id } = await SinkRepo.saveHeader({
    target: result.target,
    source: {
      ...source,
      id:
        source.type === "db"
          ? source.info.id
          : `${source.info.bucket}/${source.info.filePath}`,
    },
    operation: result.operation,
  });

  const { count } = await SinkRepo.saveItems({
    headerId: id,
    items: result.items,
  });

  return { result, stat, id, count };
};

export const process = async <
  I extends TContainerTypes,
  O extends TContainerTypes
>(
  { source, options, target }: TDefinition<I, O>,
  fn: TBodyFn<I>
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

const readSource = async <T extends TContainerTypes>(source: TSource<T>) => {
  if (source.type === "db") {
    return readFromDb(source);
  }
  if (source.type === "file") {
    return readBucket(source);
  }

  throw new Error(`Source Type ${source.type} Not Supported.`);
};

const readBucket = async (source: any) => {
  const { content, stat } = await readFile(source.info);
  return { content, stat };
};
const readFromDb = async (source: any) => {
  const content = await readSourceTypeDb({ headerId: source.info.id }, [
    { prio: 99, name: "BUILTINS_OK" },
  ]);

  return { content, stat: {} };
};

// TODO: fix target of error
export const processCanError = async <
  I extends TContainerTypes,
  O extends TContainerTypes,
  E extends TContainerTypes
>(
  { source, options, target }: TDefinition<I, O>,
  fn: TBodyFn<I>
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
    okSink: { info: { id }, type: target.type },
    errorSink: { info: { id }, type: target.type as any },
  };
};
