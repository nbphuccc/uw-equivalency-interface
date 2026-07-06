import { getDB } from "./loadDB";
import type { Equivalency } from "../types/type";

export async function searchCcCourses(
  college: string,
  ccCourse: string,
  showActiveOnly: boolean
) {
  const db = await getDB();

  let sql = `
    SELECT *
    FROM equivalencies
    WHERE college_name = ?
  `;

  const params: string[] = [college];

  const terms = ccCourse
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  for (const term of terms) {
    sql += ` AND community_college_course LIKE ?`;
    params.push(`%${term}%`);
  }

  if (showActiveOnly) {
    sql += ` AND current_course = 1`;
  }

  const stmt = db.prepare(sql);
  stmt.bind(params);

  const results: Equivalency[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as Equivalency);
  }

  return results;
}

export async function searchUwCourses(
  college: string,
  uwCourse: string,
  showActiveOnly: boolean
) {
  const db = await getDB();

  let sql = `
    SELECT *
    FROM equivalencies
    WHERE college_name = ?
  `;

  const params: string[] = [college];

  const terms = uwCourse
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  for (const term of terms) {
    sql += ` AND uw_equivalent LIKE ?`;
    params.push(`%${term}%`);
  }

  if (showActiveOnly) {
    sql += ` AND current_course = 1`;
  }

  const stmt = db.prepare(sql);
  stmt.bind(params);

  const results: Equivalency[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as Equivalency);
  }

  return results;
}

export async function getAdvisoryDetails(
  college_name: string,
  department: string,
  advisor_code: string
) {
  const db = await getDB();

  const stmt = db.prepare(`
    SELECT advisory
    FROM advisory
    WHERE college_name = ?
      AND department = ?
      AND advisor_code = ?
  `);

  stmt.bind([college_name, department, advisor_code]);

  if (stmt.step()) {
    return stmt.getAsObject().advisory as string;
  }

  return null;
}