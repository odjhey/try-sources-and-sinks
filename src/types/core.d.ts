// pipe: ( source, options ) => {info: {hasOk, hasError}, ok: sink, error: sink}

type TContainerTypes = "file" | "db";

export type TSource<T> = {
  type: T;
  refId: string;
  mimeType?: "excel" | "csv";
  info: T extends "file"
    ? { bucket: string; filePath: string }
    : { db: string; table: string };
};

export type TSink<T> = {
  type: T;
  refId: string;
  info: T extends "file"
    ? { bucket: string; filePath: string } & Record<string, any>
    : { db: string; table: string } & Record<string, any>;
};

type TSinkDuo<O extends TContainerTypes, E extends TContainerTypes> = {
  info: { hasOk: boolean; hasError: boolean };
  ok: TSink<O>;
  error: TSink<E>;
};

export type TPipeFn<
  I extends TContainerTypes,
  O extends TContainerTypes,
  E extends TContainerTypes
> = (args: {
  source: TSource<I>;
  options: any;
  target: Omit<TSink<O>, "refId">;
}) => Promise<TSink<O>>;

export type TActivityPipe<
  I extends TContainerTypes,
  O extends TContainerTypes,
  E extends TContainerTypes
> = TPipeFn<I, O, E>;
