// ResultsTable.tsx
import type { Equivalency } from "../types";

type Props = {
  results: Equivalency[];
};

export default function ResultsTable({ results }: Props) {
  const grouped = results.reduce<Record<string, Equivalency[]>>((acc, row) => {
    if (!acc[row.department]) acc[row.department] = [];
    acc[row.department].push(row);
    return acc;
  }, {});

  if (results.length === 0) return null;

  return (
    <div>
      {Object.entries(grouped).map(([department, rows]) => (
        <div key={department} style={{ marginBottom: 24 }}>

          {/* Department header */}
          <h3 style={{ marginBottom: 8, borderBottom: "2px solid #999", paddingBottom: 4 }}>
            {department}
          </h3>

          {/* Column headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              fontWeight: "bold",
              borderBottom: "2px solid #ccc",
              padding: "8px 10px",
              backgroundColor: "#f5f5f5",
            }}
          >
            <span>Course</span>
            <span>UW Equivalent</span>
            <span>UW Req</span>
            <span>Current</span>
          </div>

          {/* Data rows */}
          {rows.map((row, index) => (
            <div
              key={index}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                borderBottom: "1px solid #eee",
                padding: "8px 10px",
              }}
            >
              <span>{row.community_college_course}</span>
              <span>{row.uw_equivalent}</span>
              <span>{row.uw_req}</span>
              <span>{row.current_course}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}