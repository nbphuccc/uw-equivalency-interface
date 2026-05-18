import { getDB } from "./loadDB";
import type { Equivalency } from "../types";

export async function searchCcCourses(
  college: string,
  ccCourse: string,
  showActiveOnly: boolean
) {
  const db = await getDB();
  const currentCourseValue = showActiveOnly ? 1 : 0;

  let sql = `
    SELECT *
    FROM equivalencies
    WHERE college_name = ?
    AND community_college_course LIKE ?
  `;

  const params: string[] = [
    college,
    `%${ccCourse}%`,
  ];

  if (currentCourseValue === 1) {
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
  const currentCourseValue = showActiveOnly ? 1 : 0;

  let sql = `
    SELECT *
    FROM equivalencies
    WHERE college_name = ?
    AND uw_equivalent LIKE ?
  `;

  const params: string[] = [
    college,
    `%${uwCourse}%`,
  ];

  if (currentCourseValue === 1) {
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