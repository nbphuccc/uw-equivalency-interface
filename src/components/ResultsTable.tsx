import type { Equivalency, HoveredToken } from "../types/type";
import "./ResultsTable.css";
import { useState } from "react";
import RowTextProcessing from "./RowTextProcessing";
import { groupByDepartment } from "../utils/groupBy";

type Props = {
  results: Equivalency[];
  showActiveOnly: boolean;
  planner: Equivalency[];
  setSearchCourse: (val: string) => void;
  onSearchCc: (course: string, showActiveOnly: boolean) => void;
  onSearchUw: (course: string, showActiveOnly: boolean) => void;
  setPlanner: React.Dispatch<React.SetStateAction<Equivalency[]>>;
  tooltipHandlers: {
    handleTagEnter: (
      college: string,
      department: string,
      code: string
    ) => void;
    handleTagMove: (x: number, y: number) => void;
    hideTooltip: () => void;
  };
};

export default function ResultsTable({ results, showActiveOnly, planner, setSearchCourse, onSearchCc, onSearchUw, setPlanner, tooltipHandlers }: Props) {
  
  const [hoveredToken, setHoveredToken] = useState<HoveredToken>({position: null, row: null, column: null, department: null,});

  const grouped = groupByDepartment(results);
  
  if (results.length === 0) return null;

  return (
    <div>
      {Object.entries(grouped).map(([department, rows]) => (
        <div key={department} className="department">

          {/* Department header */}
          <h3 className="department-header"> {department} </h3>

          {/* Column headers */}
          <div className="results-grid results-header">
            <span></span>
            <span>Course</span>
            <span>UW Equivalent</span>
            <span>UW Req</span>
            <span>Effective Date</span>
            <span>Add to Planner</span>
          </div>

          {/* Data rows */}
          {rows.map((row, index) => (
            <div key={index} className="results-grid results-row">
              {/* Tag column */}
              <div className="results-grid tag-column">
                {row.current_course === 1 && (
                  <div className="current-version">
                    Current Version
                  </div>
                )}

                {(row.community_college_course?.includes("*") || department.includes("*")) && (
                  <div className="foreign-language">
                    Foreign Language
                  </div>
                )}
              </div>

              <span>
                <RowTextProcessing
                  row={row}
                  rowIndex={index}
                  columnIndex={0}
                  hoveredToken={hoveredToken}
                  setHoveredToken={setHoveredToken}
                  showActiveOnly={showActiveOnly}
                  {...tooltipHandlers}
                  onSearchCc={onSearchCc}
                  onSearchUw={onSearchUw}
                  setSearchCourse={setSearchCourse}
                />
              </span>
              <span>
                <RowTextProcessing
                  row={row}
                  rowIndex={index}
                  columnIndex={1}
                  hoveredToken={hoveredToken}
                  setHoveredToken={setHoveredToken}
                  showActiveOnly={showActiveOnly}
                  {...tooltipHandlers}
                  onSearchCc={onSearchCc}
                  onSearchUw={onSearchUw}
                  setSearchCourse={setSearchCourse}
                />
              </span>
              <span>{row.uw_req}</span>
              <span>{row.effective_date}</span>
              {/* Add to Planner */}
              <span>
                <input
                  type="checkbox"
                  checked={planner.some(item => item.rowid === row.rowid)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPlanner(prev => [...prev, row]);
                    } else {
                      setPlanner(prev =>
                        prev.filter(item => item.rowid !== row.rowid)
                      );
                    }
                  }}
                />
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}