type TContainerTypes = "file" | "db";

type TFileInfo = {
  bucket: string;
  filePath: string;
  mimeType?: "excel" | "csv";
} & Record<string, any>;

// db info is Partial for now since we using single database
type TDbInfo = Partial<{ db: string; table: string }> & {
  id: string;
} & Record<string, any>; // & { keys: Record<string, any>; }  <--- add this in the future?

export type TSource<T extends TContainerTypes> = {
  type: T;
  info: T extends "file" ? TFileInfo : TDbInfo;
};

export type TSink<T extends TContainerTypes> = {
  type: T;
  info: T extends "file" ? TFileInfo : TDbInfo;
};

export type TTarget<T extends TContainerTypes> = {
  type: T;
  info?: T extends "file" ? TFileInfo : Omit<TDbInfo, "id">;
};

type TSinkDuo<O extends TContainerTypes, E extends TContainerTypes> = {
  runInfo: { hasOk: boolean; hasError: boolean };
  okSink: TSink<O>;
  errorSink: TSink<E>;
};

export type TErrorableActivityPipe<
  I extends TContainerTypes,
  O extends TContainerTypes,
  E extends TContainerTypes
> = (args: {
  source: TSource<I>;
  options?: any;
  target: TTarget<O>;
}) => Promise<TSinkDuo<O, E>>;

export type TActivityPipe<
  I extends TContainerTypes,
  O extends TContainerTypes,
  P
> = (args: {
  source: TSource<I>;
  options?: P;
  target: TTarget<O>;
}) => Promise<TSink<O>>;
