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
              gridTemplateColumns: "120px 1fr 1fr 1fr 1fr",
              fontWeight: "bold",
              borderBottom: "2px solid #ccc",
              padding: "8px 10px",
              backgroundColor: "#f5f5f5",
              alignItems: "center",
            }}
          >
            <span></span>
            <span>Course</span>
            <span>UW Equivalent</span>
            <span>UW Req</span>
            <span>Effective Date</span>
          </div>

          {/* Data rows */}
          {rows.map((row, index) => (
            <div
              key={index}
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr 1fr 1fr 1fr",
                borderBottom: "1px solid #eee",
                padding: "8px 10px",
                alignItems: "center",
              }}
            >
              {/* Tag column */}
              <div>
                {row.current_course === 1 && (
                  <div
                    style={{
                      padding: "2px 6px",
                      backgroundColor: "#007bff",
                      color: "white",
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: "bold",
                      width: "fit-content",
                    }}
                  >
                    Current Version
                  </div>
                )}
              </div>

              {/* Course */}
              <span>{row.community_college_course}</span>

              {/* Other columns */}
              <span>{row.uw_equivalent}</span>
              <span>{row.uw_req}</span>
              <span>{row.effective_date}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}