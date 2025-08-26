import { createClient } from "redis";

import { redis as options } from "@/config";

export const redis = createClient(options);
