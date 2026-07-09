import initSqlJs from "sql.js";

type SQL = Awaited<ReturnType<typeof initSqlJs>>;
type Database = InstanceType<SQL["Database"]>;

let db: Database | null = null;

export async function getDB(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: () => "/sql-wasm.wasm", // force correct file
  });

  const response = await fetch("/equivalencies.db");
  const buffer = await response.arrayBuffer();

  db = new SQL.Database(new Uint8Array(buffer));
  return db;
}