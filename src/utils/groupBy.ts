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

export function groupByCommunityCollege(results: Equivalency[]) {
  return results.reduce<Record<string, Equivalency[]>>((currGroup, row) => {
    if (!currGroup[row.college_name]) {
      currGroup[row.college_name] = [];
    }

    currGroup[row.college_name].push(row);
    return currGroup;
  }, {});
}