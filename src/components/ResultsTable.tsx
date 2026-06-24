// ResultsTable.tsx
import type { Equivalency, TooltipData } from "../types";
import "./ResultsTable.css";
import type { ReactNode } from "react";
import { useState, useRef } from "react";
import { getAdvisoryDetails } from "../db/queries";

type Props = {
  results: Equivalency[];
};

export default function ResultsTable({ results }: Props) {

  const [tooltip, setTooltip] = useState<TooltipData>({x: 0, y: 0, data: null, visible: false});

  const cache = useRef(new Map<string, string>());

  const handleTagEnter = async (
    college: string,
    department: string,
    code: string
  ) => {
    const key = `${college}|${department}|${code}`;

    if (cache.current.has(key)) {
      setTooltip((t) => ({
        ...t,
        x: t.x,
        y: t.y,
        data: cache.current.get(key) ?? null,
        visible: true,
      }));
      return;
    }

    const data = await getAdvisoryDetails(college, department, code);
    if (!data) return;
    cache.current.set(key, data);

    setTooltip((t) => ({
      ...t,
      data,
      visible: true,
    }));
  };

  const handleTagMove = (x: number, y: number) => {
    setTooltip((t) => {
      return {
        ...t,
        x: x + 12,
        y: y + 12,
      };
    });
  };

  const hideTooltip = () => {
    setTooltip((t) => ({ ...t, visible: false }));
  };

  const grouped = results.reduce<Record<string, Equivalency[]>>((acc, row) => {
    if (!acc[row.department]) acc[row.department] = [];
    acc[row.department].push(row);
    return acc;
  }, {});

  if (results.length === 0) return null;

  const TAGS = [
    { key: "Further study", label: "Further study" },
    { key: "LC", label: "LC" },
    { key: "numeric equivalent", label: "Numeric equivalent" },
  ];

  function renderWithTags(row: Equivalency): ReactNode {
    const text = row.uw_equivalent;
    if (!text) return null;

    let parts: ReactNode[] = [text];

    TAGS.forEach((tag) => {
      parts = parts.flatMap((part) => {
        if (typeof part !== "string") return [part];

        const result: ReactNode[] = [];

        // split while keeping delimiters
        const tokens = part.split(/(\([^()]*\))/g);

        tokens.forEach((token, i) => {
          const match = token.match(/^\((.+)\)$/);

          if (match && match[1] === tag.key) {
            result.push(
              <span
                key={`${tag.key}-${i}`}
                onMouseEnter={() =>
                  handleTagEnter(
                    row.college_name,
                    row.department,
                    tag.key
                  )
                }
                onMouseMove={(e) =>
                  handleTagMove(e.clientX, e.clientY)
                }
                onMouseLeave={hideTooltip}
                className="advisory-tag"
              >
                {tag.label}
              </span>          
            );
          } else {
            result.push(token);
          }
        });
        return result;
      });
    });
    return parts;
  }

  return (
    <div>

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

                {row.community_college_course?.includes("*") || department.includes("*") && (
                  <div className="foreign-language">
                    Foreign Language
                  </div>
                )}
              </div>

              <span>{row.community_college_course}</span>
              <span>{renderWithTags(row)}</span>
              <span>{row.uw_req}</span>
              <span>{row.effective_date}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}