import { getDB } from "./loadDB";
import type { Equivalency } from "../types/type";

function tokenize(text: string): string[] {
  return text
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
}

function containsAllTokens(queryTokens: string[], resultTokens: string[]): boolean {
  const counts = new Map<string, number>();

  for (const token of resultTokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  for (const token of queryTokens) {
    const count = counts.get(token) ?? 0;
    if (count === 0) return false;
    counts.set(token, count - 1);
  }

  return true;
}

async function fallbackSearch(
  college: string,
  query: string,
  searchColumn: "community_college_course" | "uw_equivalent",
  showActiveOnly: boolean
): Promise<Equivalency[]> {
  const possibleSearches = new Set<string>();

  const normalized = query.replace(/\s+/g, "");
  possibleSearches.add(normalized);

  const numberIndex = normalized.search(/\d/);

  let prefix = normalized;
  let suffix = "";

  if (numberIndex !== -1) {
    prefix = normalized.slice(0, numberIndex);
    suffix = normalized.slice(numberIndex);
    possibleSearches.add(`${prefix} ${suffix}`);
  }

  for (let i = 1; i < prefix.length; i++) {
    const spacedPrefix = prefix.slice(0, i) + " " + prefix.slice(i);

    if (suffix) {
      possibleSearches.add(`${spacedPrefix} ${suffix}`);
    } else {
      possibleSearches.add(spacedPrefix);
    }
  }

  const results: Equivalency[] = [];

  for (const search of possibleSearches) {
    const matches = await searchCourses(
      college,
      search,
      searchColumn,
      showActiveOnly
    );

    results.push(...matches);
  }

  return results;
}

async function searchCourses(
  college: string,
  query: string,
  searchColumn: "community_college_course" | "uw_equivalent",
  showActiveOnly: boolean
): Promise<Equivalency[]> {
  const db = await getDB();

  let sql = `
    SELECT *
    FROM equivalencies
    WHERE college_name = ?
  `;

  const params: string[] = [college];

  const terms = tokenize(query);

  for (const term of terms) {
    sql += ` AND ${searchColumn} LIKE ?`;
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

  const queryTokens = tokenize(query);

  return results.filter(result => {
    const resultTokens = tokenize(result[searchColumn]);
    return containsAllTokens(queryTokens, resultTokens);
  });
}

export async function searchCcCourses(
  college: string,
  ccCourse: string,
  showActiveOnly: boolean
) {
  const results = await searchCourses(
    college,
    ccCourse,
    "community_college_course",
    showActiveOnly
  );

  if (results.length > 0) {
    return results;
  }

  return fallbackSearch(
    college,
    ccCourse,
    "community_college_course",
    showActiveOnly
  );
}

export async function searchUwCourses(
  college: string,
  uwCourse: string,
  showActiveOnly: boolean
) {
  const results = await searchCourses(
    college,
    uwCourse,
    "uw_equivalent",
    showActiveOnly
  );

  if (results.length > 0) {
    return results;
  }

  return fallbackSearch(
    college,
    uwCourse,
    "uw_equivalent",
    showActiveOnly
  );
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