import { useState } from "react";
import { useAdvisoryTooltip } from "../hooks/useAdvisoryTooltip";
import type { Equivalency, HoveredToken } from "../types/type";
import RowTextProcessing from "./RowTextProcessing";
import { groupByCommunityCollege } from "../utils/groupBy";
import "./ResultsTable.css";

type Props = {
  showActiveOnly: boolean;
  planner: Equivalency[];
  setSearchCourse: (val: string) => void;
  setSelectedCollege: (collegeName: string, collegeGroup: string) => void;
  onSearchCc: (course: string, showActiveOnly: boolean, college: string) => void;
  onSearchUw: (course: string, showActiveOnly: boolean, college: string) => void;
  setPlanner: React.Dispatch<React.SetStateAction<Equivalency[]>>;
};

export default function Planner({
  showActiveOnly,
  planner,
  setSearchCourse,
  setSelectedCollege,
  onSearchCc,
  onSearchUw,
  setPlanner,
}: Props) {

    const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredToken, setHoveredToken] = useState<HoveredToken>({
    position: null,
    row: null,
    column: null,
    department: null,
  });

  const grouped = groupByCommunityCollege(planner);

  const {
    tooltip,
    handleTagEnter,
    handleTagMove,
    hideTooltip,
  } = useAdvisoryTooltip();

  if (planner.length === 0) return null;

return (
  <div className="planner">
    <button
      type="button"
      className="planner-toggle"
      onClick={() => setIsExpanded((previous) => !previous)}
      aria-expanded={isExpanded}
      aria-controls="planner-content"
    >
      <span>Planner ({planner.length})</span>
      <span aria-hidden="true">{isExpanded ? "▲" : "▼"}</span>
    </button>

    {isExpanded && (
      <div id="planner-content">
        {tooltip.visible && tooltip.data && (
          <div
            className="tooltip"
            style={{
              top: tooltip.y,
              left: tooltip.x,
            }}
          >
            {tooltip.data}
          </div>
        )}

        {Object.entries(grouped).map(([collegeName, rows]) => (
          <div key={collegeName} className="department">
            <h3 className="department-header">{collegeName}</h3>

            <div className="results-grid results-header">
              <span></span>
              <span>Course</span>
              <span>UW Equivalent</span>
              <span>UW Req</span>
              <span>Effective Date</span>
              <span>Remove from Planner</span>
            </div>

            {rows.map((row, index) => (
              <div
                key={row.rowid}
                className="results-grid results-row"
              >
                <div className="results-grid tag-column">
                  {row.current_course === 1 && (
                    <div className="current-version">
                      Current Version
                    </div>
                  )}

                  {(row.community_college_course?.includes("*") ||
                    row.department.includes("*")) && (
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
                    handleTagEnter={handleTagEnter}
                    handleTagMove={handleTagMove}
                    hideTooltip={hideTooltip}
                    onSearchCc={onSearchCc}
                    onSearchUw={onSearchUw}
                    setSearchCourse={setSearchCourse}
                    setSelectedCollege={setSelectedCollege}
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
                    handleTagEnter={handleTagEnter}
                    handleTagMove={handleTagMove}
                    hideTooltip={hideTooltip}
                    onSearchCc={onSearchCc}
                    onSearchUw={onSearchUw}
                    setSearchCourse={setSearchCourse}
                    setSelectedCollege={setSelectedCollege}
                  />
                </span>

                <span>{row.uw_req}</span>
                <span>{row.effective_date}</span>

                <span>
                  <input
                    type="checkbox"
                    checked
                    aria-label={`Remove ${row.community_college_course} from planner`}
                    onChange={() => {
                      setPlanner((previous) =>
                        previous.filter(
                          (item) => item.rowid !== row.rowid
                        )
                      );
                    }}
                  />
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    )}
  </div>
);
}