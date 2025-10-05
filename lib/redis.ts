import { createClient, RESP_TYPES } from "redis";

import { redis as options } from "@/config";

export const redis = createClient(options).withTypeMapping({
  [RESP_TYPES.BLOB_STRING]: Buffer,
});
