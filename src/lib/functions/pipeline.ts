type Middleware<T> = (context: T) => T;

// TODO: create pipelineAsync version
function pipeline<T, O>(
  middlewares: Middleware<T | O>[],
  initialContext: T
): O {
  const runner = (index: number, context: T | O): T | O => {
    const middleware = middlewares[index];

    if (middleware) {
      const result = middleware(context);
      return runner(index + 1, result);
    }

    return context;
  };

  // TODO: fix below typing
  // @ts-ignore
  return runner(0, initialContext);
}

export { pipeline };
