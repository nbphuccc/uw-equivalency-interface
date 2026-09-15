import type { ReactNode } from "react";
import type { Equivalency, HoveredToken, Token } from "../types/type";
import { colleges } from "../utils/collegeGrouping";

const TAGS = [
  { key: "Further study", label: "Further study" },
  { key: "LC", label: "LC" },
  { key: "numeric equivalent", label: "Numeric equivalent" },
];

type Props = {
  row: Equivalency;
  hoveredToken: HoveredToken;
  showActiveOnly: boolean;
  rowIndex: number;
  columnIndex: number;
  setHoveredToken: React.Dispatch<React.SetStateAction<HoveredToken>>;
  handleTagEnter: (college: string, department: string, code: string) => void;
  handleTagMove: (x: number, y: number) => void;
  hideTooltip: () => void;
  onSearchCc: (course: string, showActiveOnly: boolean, college: string) => void;
  onSearchUw: (course: string, showActiveOnly: boolean, college: string) => void;
  setSearchCourse: (val: string) => void;
  setSelectedCollege?: (collegeName: string, collegeGroup: string) => void;
};

export default function RowTextProcessing({ row, hoveredToken, showActiveOnly, rowIndex, columnIndex, setHoveredToken, handleTagEnter, handleTagMove, hideTooltip, onSearchCc, onSearchUw, setSearchCourse, setSelectedCollege }: Props) {

  function renderAdvisoryTags(parts: ReactNode[]): ReactNode[] {
    TAGS.forEach((tag) => {
      parts = parts.flatMap((part) => {
        if (typeof part !== "string") return [part];

        const result: ReactNode[] = [];
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

  function renderHighlightedCourses(parts: ReactNode[], rowIndex: number, columnIndex: number, department: string): ReactNode[] {
    return parts.flatMap((part) => {
      if (typeof part !== "string") {
        return [part];
      }

      return annotateString(part, rowIndex, columnIndex, department);
    });
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

  function annotateString(text: string, rowIndex: number, columnIndex: number, department: string): ReactNode[] {
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

    return tokens.map((token, i) => {
      const active =
        hoveredToken.position !== null &&
        hoveredToken.row === rowIndex &&
        hoveredToken.department === department &&
        hoveredToken.column === columnIndex &&
        tagMap.get(hoveredToken.position)?.includes(i);

      return (
        <span
          key={`${department}-${rowIndex}-${columnIndex}-${i}`}
          className={active ? "course-highlight" : ""}
          onMouseEnter={() => {
            //console.log("Hover:", token.text, i);
            setHoveredToken({position: i, row: rowIndex, column: columnIndex, department: department});
          }}
          onMouseLeave={() => { 
            setHoveredToken({position: null, row: null, column: null, department: null});
          }}
          onClick={() => {
            if (hoveredToken.position === null) return;

            const indices = tagMap.get(hoveredToken.position) || [];

            const activeText = indices
              .map(idx => tokens[idx]?.text.trim())
              .filter(Boolean)
              .join(" ");

            setSearchCourse(activeText);
            if (setSelectedCollege) {
              const collegeGroup = row.college_name;

              const matchingColleges = colleges.filter(
                (college) => college.group === collegeGroup
              );

              const collegeName =
                matchingColleges.length === 1
                  ? matchingColleges[0].name
                  : collegeGroup;

              setSelectedCollege(collegeName, collegeGroup);
            }

            if (columnIndex === 0) {
              console.log(row);
              console.log("Searching CC:", activeText, showActiveOnly, row.college_name);
              onSearchCc(activeText, showActiveOnly, row.college_name);
            } else if (columnIndex === 1) {
              console.log("Searching UW:", activeText, showActiveOnly, row.college_name);
              onSearchUw(activeText, showActiveOnly, row.college_name);
            }
          }}
        >
          {token.text}
        </span>
      );
    });
  }

  let parts: ReactNode[] = [];

  if (columnIndex === 0) {
    parts = [row.community_college_course];
  } else if (columnIndex === 1) {
    parts = [row.uw_equivalent];
  }

  parts = renderHighlightedCourses(parts, rowIndex, columnIndex, row.department);

  parts = renderAdvisoryTags(parts);

  return <>{parts}</>;
}