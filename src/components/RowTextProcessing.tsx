import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { Equivalency, HoveredToken, Token } from "../types/type";
import { colleges } from "../utils/collegeGrouping";

const TAGS = [
  { key: "Further study", label: "Further study" },
  { key: "LC", label: "LC" },
  { key: "numeric equivalent", label: "Numeric equivalent" },
];

type AdvisoryTag = (typeof TAGS)[number];
type HighlightMap = Map<number, number[]>;
type AdvisoryMatch = { tag: AdvisoryTag; closingIndex: number };

type Props = {
  row: Equivalency;
  hoveredToken: HoveredToken;
  showActiveOnly: boolean;
  rowIndex: number;
  columnIndex: number;
  setHoveredToken: Dispatch<SetStateAction<HoveredToken>>;
  handleTagEnter: (college: string, department: string, code: string) => void;
  handleTagMove: (x: number, y: number) => void;
  hideTooltip: () => void;
  onSearchCc: (
    course: string,
    showActiveOnly: boolean,
    college: string,
  ) => void;
  onSearchUw: (
    course: string,
    showActiveOnly: boolean,
    college: string,
  ) => void;
  setSearchCourse: (val: string) => void;
  setSelectedCollege?: (collegeName: string, collegeGroup: string) => void;
};

function tokenize(text: string): Token[] {
  return text
    .split(/(\s+|,|;|\/|\(|\))/)
    .filter(Boolean)
    .map((text) => ({
      text,
      type: /^\s+$/.test(text)
        ? "space"
        : /^[A-Z0-9.&]+$/.test(text)
          ? "word"
          : "other",
    }));
}

function isSingleLetter(text: string): boolean {
  return /^[A-Z]$/.test(text);
}

function isPrefix(text: string): boolean {
  return /^[A-Z&]{2,}$/.test(text);
}

function isSuffix(text: string): boolean {
  return text.includes(".")
    ? /^[A-Z0-9.]{4,}$/.test(text)
    : /^[A-Z0-9.]{3,}$/.test(text);
}

function findPrefixEnd(tokens: Token[], start: number): number {
  let end = start;

  while (true) {
    const space = tokens[end + 1];
    const next = tokens[end + 2];

    if (
      !space ||
      !next ||
      space.type !== "space" ||
      next.type !== "word" ||
      (!isPrefix(next.text) && !isSingleLetter(next.text))
    ) {
      return end;
    }

    end += 2;
  }
}

function buildHighlightMap(tokens: Token[]): HighlightMap {
  const highlightMap: HighlightMap = new Map();
  let currentPrefix: [number, number] | null = null;
  let firstSuffix = true;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type !== "word") continue;

    if (isPrefix(token.text) || isSingleLetter(token.text)) {
      const end = findPrefixEnd(tokens, i);
      currentPrefix = [i, end];
      firstSuffix = true;
      i = end;
      continue;
    }

    if (!isSuffix(token.text) || !currentPrefix) continue;

    const [start, end] = currentPrefix;
    const highlightedIndices: number[] = [];

    for (let j = start; j <= end; j++) {
      highlightedIndices.push(j);
    }

    highlightedIndices.push(i);

    if (firstSuffix) {
      for (let j = start; j <= end; j++) {
        highlightMap.set(j, highlightedIndices);
      }

      firstSuffix = false;
    }

    highlightMap.set(i, highlightedIndices);
  }

  return highlightMap;
}

function findAdvisoryTag(
  tokens: Token[],
  openingIndex: number,
): AdvisoryMatch | null {
  if (tokens[openingIndex]?.text !== "(") return null;

  const closingIndex = tokens.findIndex(
    (token, index) => index > openingIndex && token.text === ")",
  );

  if (closingIndex === -1) return null;

  const advisoryText = tokens
    .slice(openingIndex + 1, closingIndex)
    .map((token) => token.text)
    .join("")
    .trim()
    .replace(/\s+/g, " ");

  const tag = TAGS.find((candidate) => candidate.key === advisoryText);
  return tag ? { tag, closingIndex } : null;
}

export default function RowTextProcessing({
  row,
  hoveredToken,
  showActiveOnly,
  rowIndex,
  columnIndex,
  setHoveredToken,
  handleTagEnter,
  handleTagMove,
  hideTooltip,
  onSearchCc,
  onSearchUw,
  setSearchCourse,
  setSelectedCollege,
}: Props) {
  function updateSelectedCollege(): void {
    if (!setSelectedCollege) return;

    const collegeGroup = row.college_name;
    const matchingColleges = colleges.filter(
      (college) => college.group === collegeGroup,
    );
    const collegeName =
      matchingColleges.length === 1 ? matchingColleges[0].name : collegeGroup;

    setSelectedCollege(collegeName, collegeGroup);
  }

  function handleCourseClick(
    tokens: Token[],
    highlightMap: HighlightMap,
  ): void {
    if (hoveredToken.position === null) return;

    const indices = highlightMap.get(hoveredToken.position) ?? [];
    const activeText = indices
      .map((index) => tokens[index]?.text.trim())
      .filter(Boolean)
      .join(" ");

    setSearchCourse(activeText);
    updateSelectedCollege();

    if (columnIndex === 0) {
      onSearchCc(activeText, showActiveOnly, row.college_name);
    } else if (columnIndex === 1) {
      onSearchUw(activeText, showActiveOnly, row.college_name);
    }
  }

  function renderAdvisoryTag(tag: AdvisoryTag, tokenIndex: number): ReactNode {
    return (
      <span
        key={`advisory-${row.department}-${rowIndex}-${columnIndex}-${tokenIndex}`}
        className="advisory-tag"
        onMouseEnter={() =>
          handleTagEnter(row.college_name, row.department, tag.key)
        }
        onMouseMove={(event) => handleTagMove(event.clientX, event.clientY)}
        onMouseLeave={hideTooltip}
      >
        {tag.label}
      </span>
    );
  }

  function renderCourseToken(
    token: Token,
    tokenIndex: number,
    tokens: Token[],
    highlightMap: HighlightMap,
    department: string,
  ): ReactNode {
    const active =
      hoveredToken.position !== null &&
      hoveredToken.row === rowIndex &&
      hoveredToken.department === department &&
      hoveredToken.column === columnIndex &&
      highlightMap.get(hoveredToken.position)?.includes(tokenIndex);

    return (
      <span
        key={`${department}-${rowIndex}-${columnIndex}-${tokenIndex}`}
        className={active ? "course-highlight" : ""}
        onMouseEnter={() =>
          setHoveredToken({
            position: tokenIndex,
            row: rowIndex,
            column: columnIndex,
            department,
          })
        }
        onMouseLeave={() =>
          setHoveredToken({
            position: null,
            row: null,
            column: null,
            department: null,
          })
        }
        onClick={() => handleCourseClick(tokens, highlightMap)}
      >
        {token.text}
      </span>
    );
  }

  function renderTokens(
    tokens: Token[],
    highlightMap: HighlightMap,
    department: string,
  ): ReactNode[] {
    const rendered: ReactNode[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const advisory = findAdvisoryTag(tokens, i);

      if (advisory) {
        rendered.push(renderAdvisoryTag(advisory.tag, i));
        i = advisory.closingIndex;
        continue;
      }

      rendered.push(
        renderCourseToken(tokens[i], i, tokens, highlightMap, department),
      );
    }

    return rendered;
  }

  function annotateString(text: string, department: string): ReactNode[] {
    const tokens = tokenize(text);
    const highlightMap = buildHighlightMap(tokens);
    return renderTokens(tokens, highlightMap, department);
  }

  const text =
    columnIndex === 0
      ? row.community_college_course
      : columnIndex === 1
        ? row.uw_equivalent
        : "";

  return <>{annotateString(text, row.department)}</>;
}