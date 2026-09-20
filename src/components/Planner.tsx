import { useState, useLayoutEffect, useRef } from "react";
import type { Equivalency, HoveredToken } from "../types/type";
import RowTextProcessing from "./RowTextProcessing";
import { groupByCommunityCollege } from "../utils/groupBy";
import trashCanIcon from "../assets/trash-can.svg";
import "./ResultsTable.css";
import PlannerExporter from "./PlannerExporter";

type Props = {
  showActiveOnly: boolean;
  planner: Equivalency[];
  setSearchCourse: (val: string) => void;
  setSelectedCollege: (collegeName: string, collegeGroup: string) => void;
  onSearchCc: (course: string, showActiveOnly: boolean, college: string) => void;
  onSearchUw: (course: string, showActiveOnly: boolean, college: string) => void;
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

export default function Planner({
  showActiveOnly,
  planner,
  setSearchCourse,
  setSelectedCollege,
  onSearchCc,
  onSearchUw,
  setPlanner,
  tooltipHandlers,
}: Props) {

    const [isExpanded, setIsExpanded] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);
    const plannerContentRef = useRef<HTMLDivElement>(null);
  const [hoveredToken, setHoveredToken] = useState<HoveredToken>({
    position: null,
    row: null,
    column: null,
    department: null,
  });

  useLayoutEffect(() => {
    const content = plannerContentRef.current;
    if (!content) return;

    const updateHeight = () => {
      setContentHeight(content.scrollHeight);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(content);

    return () => resizeObserver.disconnect();
  }, []);

  const grouped = groupByCommunityCollege(planner);

  return (
    <div className="planner">
      <button
        type="button"
        className="planner-toggle"
        onClick={() => setIsExpanded((previous) => !previous)}
        aria-expanded={isExpanded}
        aria-controls="planner-content"
      >
        <span>
          {planner.length === 0
            ? "Planner (Empty)"
            : `Planner (${planner.length})`}
        </span>

        <span
          className={`planner-arrow ${isExpanded ? "expanded" : ""}`}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>

      <div
          id="planner-content"
          className="planner-content-wrapper"
          style={{
              height: isExpanded ? `${contentHeight}px` : "0px",
          }}
          aria-hidden={!isExpanded}
      >
      <div
          ref={plannerContentRef}
          className={`planner-content ${isExpanded ? "expanded" : ""}`}
      >
          {planner.length === 0 ? (
            <p className="planner-empty">
              No courses have been added to the planner.
            </p>
          ) : (
            <>
              {Object.entries(grouped).map(([collegeName, rows]) => (
                <div key={collegeName} className="department">
                  <h3 className="department-header">
                    {collegeName}
                  </h3>

                  <div className="results-grid results-header">
                    <span></span>
                    <span>Course</span>
                    <span>UW Equivalent</span>
                    <span>UW Req</span>
                    <span>Effective Date</span>
                    <span>Remove</span>
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
                          {...tooltipHandlers}
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
                          {...tooltipHandlers}
                          onSearchCc={onSearchCc}
                          onSearchUw={onSearchUw}
                          setSearchCourse={setSearchCourse}
                          setSelectedCollege={setSelectedCollege}
                        />
                      </span>

                      <span>{row.uw_req}</span>
                      <span>{row.effective_date}</span>

                      <span>
                          <button
                              type="button"
                              className="planner-remove-button"
                              aria-label={`Remove ${row.community_college_course} from planner`}
                              title="Remove from planner"
                              onClick={() => {
                                  setPlanner((previous) =>
                                  previous.filter((item) => item.rowid !== row.rowid)
                                  );
                              }}
                              >
                              <img src={trashCanIcon} alt="" />
                          </button>
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}

          <div className="export-planner-container">
              <PlannerExporter planner={planner} />
          </div>

        </div>
      </div>
    </div>
  );
}