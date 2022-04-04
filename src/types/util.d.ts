export type TParseResult<T, E, I> =
  | { ok: true; data: T; input: I }
  | { ok: false; error: E; input: I }
