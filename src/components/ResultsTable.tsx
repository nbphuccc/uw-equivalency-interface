// ResultsTable.tsx
import type { Equivalency, TooltipData, Token } from "../types/type";
import "./ResultsTable.css";
import type { ReactNode } from "react";
import { useState, useRef, Children } from "react";
import { getAdvisoryDetails } from "../db/queries";

type Props = {
  results: Equivalency[];
  showActiveOnly: boolean;
  setSearchCourse: (val: string) => void;
  onSearchCc: (course: string, showActiveOnly: boolean) => void;
  onSearchUw: (course: string, showActiveOnly: boolean) => void;
};

export default function ResultsTable({ results, showActiveOnly, setSearchCourse, onSearchCc, onSearchUw }: Props) {

  const [tooltip, setTooltip] = useState<TooltipData>({x: 0, y: 0, data: null, visible: false});
  const cache = useRef(new Map<string, string>());
  const [hoveredToken, setHoveredToken] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredDepartment, setHoveredDepartment] = useState<string | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);

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

  function renderWithCourses(parts: ReactNode, rowIndex: number, columnIndex: number, department: string): ReactNode[] {
    const text = Children.toArray(parts)
      .map((n) => (typeof n === "string" ? n : ""))
      .join("");

    return annotateString(text, rowIndex, columnIndex, department);
  }

  function tokenize(text: string): Token[] {
    return text
      .split(/(\s+|,|;|\/|\(|\))/)
      .filter(Boolean)
      .map((t) => ({
        text: t,
        type: /^\s+$/.test(t)
          ? "space"
          : /^[A-Z0-9.&]+$/.test(t)
          ? "word"
          : "other",
      }));
  }

  function isSingleLetter(s: string) {
    return /^[A-Z]$/.test(s);
  }

  function isPrefix(s: string) {
    return /^[A-Z&]{2,}$/.test(s);
  }

  function isSuffix(s: string) {
    return s.includes(".")
      ? /^[A-Z0-9.]{4,}$/.test(s)
      : /^[A-Z0-9.]{3,}$/.test(s);
  }

  function annotateString(
    text: string,
    rowIndex: number,
    columnIndex: number,
    department: string
  ): ReactNode[] {
    const tokens = tokenize(text);
    //console.log(tokens);

    // hovered token index -> token indices to highlight
    const tagMap = new Map<number, number[]>();

    let currPrefix: [number, number] | null = null;
    let currSuffix: number | null = null;
    let firstSuffix = true;

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];

      if (t.type !== "word") {
        continue;
      }

      // -------------------------
      // PREFIX
      // -------------------------
      if (isPrefix(t.text) || isSingleLetter(t.text)) {
        const start = i;
        let end = i;

        while (true) {
          const space = tokens[end + 1];
          const next = tokens[end + 2];

          if (
            !space ||
            !next ||
            space.type !== "space" ||
            next.type !== "word" ||
            (!isPrefix(next.text) &&
              !isSingleLetter(next.text))
          ) {
            break;
          }

          end += 2;
        }

        currPrefix = [start, end];
        firstSuffix = true;

        i = end;
        continue;
      }

      // -------------------------
      // SUFFIX
      // -------------------------
      if (isSuffix(t.text) && currPrefix) {
        currSuffix = i;

        const [start, end] = currPrefix;

        const highlight: number[] = [];

        // include all prefix tokens, including spaces
        for (let j = start; j <= end; j++) {
          highlight.push(j);
        }

        // include suffix
        highlight.push(currSuffix);

        // first suffix owns the prefix
        if (firstSuffix) {
          for (let j = start; j <= end; j++) {
            tagMap.set(j, highlight);
          }

          firstSuffix = false;
        }

        // every suffix owns itself
        tagMap.set(currSuffix, highlight);
      }
    }

    /*
    console.log("TAG MAP");

    for (const [key, value] of tagMap.entries()) {
      console.log(tokens[key].text, "=>", value);
    }
    */

    return tokens.map((token, i) => {
      const active =
        hoveredToken !== null &&
        hoveredRow === rowIndex &&
        hoveredDepartment === department &&
        hoveredColumn === columnIndex &&
        tagMap.get(hoveredToken)?.includes(i);

      return (
        <span
          key={`${department}-${rowIndex}-${columnIndex}-${i}`}
          className={active ? "course-highlight" : ""}
          onMouseEnter={() => {
            //console.log("Hover:", token.text, i);
            setHoveredToken(i);
            setHoveredRow(rowIndex);
            setHoveredDepartment(department);
            setHoveredColumn(columnIndex);
          }}
          onMouseLeave={() => { 
            setHoveredToken(null);
            setHoveredRow(null);
            setHoveredDepartment(null);
            setHoveredColumn(null);
          }}
          onClick={() => {
            if (hoveredToken === null) return;

            const indices = tagMap.get(hoveredToken) || [];

            const activeText = indices
              .map(idx => tokens[idx]?.text.trim())
              .filter(Boolean)
              .join(" ");

            setSearchCourse(activeText);

            if (columnIndex === 0) {
              onSearchCc(activeText, showActiveOnly);
            } else if (columnIndex === 1) {
              onSearchUw(activeText, showActiveOnly);
            }
          }}
        >
          {token.text}
        </span>
      );
    });
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

              <span>{renderWithCourses(row.community_college_course, index, 0, department)}</span>
              <span>{renderWithCourses(renderWithTags(row), index, 1, department)}</span>
              <span>{row.uw_req}</span>
              <span>{row.effective_date}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}