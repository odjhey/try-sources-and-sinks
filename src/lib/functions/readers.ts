import * as SinkRepo from "../repos/sink";

export const readSourceTypeDb = async (
  where: { headerId: string },
  filters: { prio: number; name: string }[]
) => {
  // const builtins

  const hasBuiltInOkOnly = filters.find((f) => f.name === "BUILTINS_OK");
  const hasBuiltInErrorOnly = filters.find((f) => f.name === "BUILTINS_ERROR");

  if (hasBuiltInOkOnly) {
    return SinkRepo.getItems({ headerId: where.headerId, ok: true });
  }
  if (hasBuiltInErrorOnly) {
    return SinkRepo.getItems({ headerId: where.headerId, ok: false });
  }
  return SinkRepo.getItems({ headerId: where.headerId });
};
