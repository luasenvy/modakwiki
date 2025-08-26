import { Pool } from "pg";

import { postgresql } from "@/config";

export const pool = new Pool(postgresql);
