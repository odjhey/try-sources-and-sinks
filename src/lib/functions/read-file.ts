import {
  getClient,
  getFileAsStream,
  getFileStat,
} from "../object-store-client";
import { serializeStream } from "./serializeStream";

export const readFile = async (fileInfo: {
  bucket: string;
  filePath: string;
}) => {
  const { bucket, filePath } = fileInfo;
  const readable = await getFileAsStream(getClient(), { bucket, filePath });

  // TODO: if (["csv", "excel"]source.info.mimeType)
  const content = await serializeStream(readable);
  const stat = await getFileStat(getClient(), { bucket, filePath });

  return { content, stat };
};
