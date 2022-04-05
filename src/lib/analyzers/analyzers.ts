import { DataFrame, toJSON } from "danfojs-node";

export const analyzeRawFrame = async (rawFrame: any[]) => {
  const df = new DataFrame(rawFrame);

  const shape = df.shape;
  const [rowCount, colCount] = shape;

  const uniquePerColumn = df.nUnique(0);
  const columns = df.axis.columns;
  const sampleCount = 5;
  const sample = await df.sample(
    rowCount > sampleCount ? sampleCount : rowCount
  );

  const columnsSummary = columns.map((col) => {
    const colDataType = df.column(`${col}`).dtype;
    return {
      column: col,
      dataType: colDataType,
      unique: uniquePerColumn.at(`${col}`),
    };
  });

  const summary = {
    schemaVersion: "0.0.1",
    rowCount,
    colCount,
    columns,
    sample: toJSON(sample),
    columnsSummary,
  };

  return summary;
};
