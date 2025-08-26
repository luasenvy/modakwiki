const isDev = process.env.NODE_ENV === "development";

export const DIR = {
  ASC: "ASC",
  DESC: "DESC",
} as const;

export class Sql {
  private sql: string;

  constructor(sql: string = "") {
    this.sql = sql;
  }

  start(sql: string = "") {
    this.sql = sql;
    return this;
  }

  append(str: string) {
    this.sql += `\n${str}`;
    return this;
  }

  orderby(column: string, dir: (typeof DIR)[keyof typeof DIR] = DIR.ASC) {
    this.append(`ORDER BY ${column} ${dir}`);
    return this;
  }

  paginate(from: number, limit: number) {
    if (from) this.append(`OFFSET ${from}`);
    if (limit) this.append(`LIMIT ${limit}`);
    return this;
  }

  toString() {
    if (isDev) console.debug(`SQL > ${this.sql.replace(/(^\s+)?[\s]{2,}(\s+$)?/g, " ").trim()}`);

    return this.sql;
  }

  flush() {
    const sql = this.toString();

    this.sql = "";

    return sql;
  }
}
