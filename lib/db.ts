import Knex from "knex";
import { Pool } from "pg";
import { postgresql as connection } from "@/config";

export const knex = Knex({ client: "pg", connection });

// 아직 knex 지원이 안됨
// better-auth용 pool 별도 생성 관리
export const pool = new Pool(connection);
