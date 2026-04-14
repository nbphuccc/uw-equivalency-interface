import { getDB } from "./loadDB";
import type { Equivalency } from "../types";

export async function searchCourses(
  college: string,
  query: string
) {
  const db = await getDB();

  const stmt = db.prepare(`
    SELECT *
    FROM equivalencies
    WHERE college_name = ?
    AND community_college_course LIKE ?
  `);

  stmt.bind([college, `%${query}%`]);

const results: Equivalency[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as Equivalency);
  }

  return results;
}