import type { Equivalency } from "../types/type";

export function groupByDepartment(results: Equivalency[]) {
  return results.reduce<Record<string, Equivalency[]>>((currGroup, row) => {
    if (!currGroup[row.department]) {
      currGroup[row.department] = [];
    }

    currGroup[row.department].push(row);
    return currGroup;
  }, {});
}