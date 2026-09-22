import { useEffect, useState } from "react";
import ImportPlannerButton from "./ImportPlannerButton";
import ImportTranscriptButton from "./ImportTranscriptButton";
import "./ImportControls.css";
import { loadPdfFile } from "../utils/loadPdfFile";
import {searchExactCcCourses} from "../db/queries";
import type { PDFDocumentProxy, TextItem} from "pdfjs-dist/types/src/display/api";
import type { Equivalency, ImportedPlannerRow, PositionedText, TextLine, PlannerMetadata } from "../types/type";

type Props = {
  collegeSelected: boolean;
  planner: Equivalency[];
  onPlannerImported: (
    courses: Equivalency[]
  ) => void;
};

export default function ImportControls({collegeSelected, planner, onPlannerImported}: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
	const [messageVisible, setMessageVisible] = useState(false);

	useEffect(() => {
		if (!error && !success) {
			setMessageVisible(false);
			return;
		}

		setMessageVisible(true);

		const fadeTimer = window.setTimeout(() => {
			setMessageVisible(false);
		}, 4500);

		const removeTimer = window.setTimeout(() => {
			setError(null);
			setSuccess(null);
		}, 5000);

		return () => {
			window.clearTimeout(fadeTimer);
			window.clearTimeout(removeTimer);
		};
	}, [error, success]);

  async function extractPlannerMetadata(pdf: PDFDocumentProxy): Promise<ImportedPlannerRow[] | null> {
  const result = await pdf.getMetadata();
  const rawMetadata =
    result.metadata?.get("jspdf:metadata");

  if (typeof rawMetadata !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(
      decodeURIComponent(rawMetadata)
    ) as PlannerMetadata;

    if (!Array.isArray(parsed.courses)) {
      return null;
    }

    const coursesAreValid = parsed.courses.every(
      (course) =>
        typeof course.college === "string" &&
        typeof course.course === "string" &&
        typeof course.effectiveDate === "string"
    );

    if (!coursesAreValid) {
      return null;
    }

    return parsed.courses;
  } catch {
    return null;
  }
}

  async function handlePlannerFileSelected(
  file: File
): Promise<void> {
  setIsProcessing(true);
  setError(null);
  setSuccess(null);

  try {
    const pdf = await loadPdfFile(file);

    // Check metadata. If fails, fall back to parsing the PDF content.
    const metadataRows =
      await extractPlannerMetadata(pdf);

    const importedRows =
      metadataRows ??
      await extractPlannerRows(pdf);

    if (importedRows.length === 0) {
      throw new Error(
        "No courses were found in this planner PDF."
      );
    }

    const searchResults = await Promise.all(
      importedRows.map((row) =>
        searchExactCcCourses(
          row.college,
          row.course,
          row.effectiveDate
        )
      )
    );

    const matches = searchResults.flat();

    if (matches.length === 0) {
      throw new Error(
        "The courses could not be found in the database."
      );
    }

    const updatedPlanner = Array.from(
      new Map(
        [...planner, ...matches].map((course) => [
          course.rowid,
          course,
        ])
      ).values()
    );

    onPlannerImported(updatedPlanner);

    const importedCount =
      updatedPlanner.length - planner.length;

    setSuccess(
      `Imported ${importedCount} ${
        importedCount === 1
          ? "course"
          : "courses"
      } to the planner.`
    );
  } catch (error) {
    console.error(error);

    setError(
      error instanceof Error
        ? error.message
        : "The planner PDF could not be imported."
    );
  } finally {
    setIsProcessing(false);
  }
}

function isTextItem(item: unknown): item is TextItem {
  return (
    typeof item === "object" &&
    item !== null &&
    "str" in item &&
    "transform" in item
  );
}

function groupTextIntoLines(
  items: PositionedText[]
): TextLine[] {
  const lines: TextLine[] = [];
  const yTolerance = 2;

  const sorted = [...items].sort(
    (first, second) =>
      second.y - first.y || first.x - second.x
  );

  for (const item of sorted) {
    const existingLine = lines.find(
      (line) =>
        Math.abs(line.y - item.y) <= yTolerance
    );

    if (existingLine) {
      existingLine.items.push(item);
      existingLine.items.sort(
        (first, second) => first.x - second.x
      );
    } else {
      lines.push({
        y: item.y,
        items: [item],
      });
    }
  }

  return lines.sort(
    (first, second) => second.y - first.y
  );
}

async function extractPlannerRows(
  pdf: PDFDocumentProxy
): Promise<ImportedPlannerRow[]> {
  const rows: ImportedPlannerRow[] = [];

  let currentCollege = "";
  let pendingCollege = "";

  for (
    let pageNumber = 1;
    pageNumber <= pdf.numPages;
    pageNumber++
  ) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();

    const positionedText: PositionedText[] = content.items
      .filter(isTextItem)
      .map((item) => ({
        text: item.str.trim(),
        x: item.transform[4],
        y: item.transform[5],
      }))
      .filter((item) => item.text.length > 0);

    const lines = groupTextIntoLines(positionedText);

    let courseBoundary: number | null = null;
    let dateBoundary: number | null = null;
    let pendingRow: ImportedPlannerRow | null = null;

    function savePendingRow(): void {
      if (pendingRow) {
        rows.push(pendingRow);
        pendingRow = null;
      }
    }

    for (const line of lines) {
      const lineText = line.items
        .map((item) => item.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (lineText === "UW Transfer Planner") {
        continue;
      }

      const courseHeader = line.items.find(
        (item) => item.text === "Course"
      );

      const uwEquivalentHeader = line.items.find(
        (item) => item.text === "UW Equivalent"
      );

      const uwReqHeader = line.items.find(
        (item) => item.text === "UW Req"
      );

      const effectiveDateHeader = line.items.find(
        (item) => item.text === "Effective Date"
      );

      const isHeader =
        courseHeader &&
        uwEquivalentHeader &&
        uwReqHeader &&
        effectiveDateHeader;

      if (isHeader) {
        savePendingRow();

        if (pendingCollege) {
          currentCollege = pendingCollege;
          pendingCollege = "";
        }

        courseBoundary =
          (courseHeader.x + uwEquivalentHeader.x) / 2;

        dateBoundary =
          (uwReqHeader.x + effectiveDateHeader.x) / 2;

        continue;
      }

      if (
        courseBoundary !== null &&
        dateBoundary !== null &&
        pendingRow
        ) {
        const validCourseBoundary = courseBoundary;
        const validDateBoundary = dateBoundary;

        const continuationDate = line.items
            .filter(
            (item) => item.x >= validDateBoundary
            )
            .map((item) => item.text)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();

        const hasCourseText = line.items.some(
            (item) => item.x < validCourseBoundary
        );

        if (!hasCourseText && continuationDate) {
            pendingRow.effectiveDate = [
            pendingRow.effectiveDate,
            continuationDate,
            ]
            .filter(Boolean)
            .join(" ");

            continue;
        }
    	}

      /*
       * College headings contain one text item and appear
       * immediately before a repeated table header.
       */
      if (line.items.length === 1) {
        pendingCollege = lineText;
        continue;
      }

      if (
        !currentCollege ||
        courseBoundary === null ||
        dateBoundary === null
      ) {
        continue;
      }

      const validCourseBoundary = courseBoundary;
      const validDateBoundary = dateBoundary;

      const course = line.items
        .filter(
          (item) => item.x < validCourseBoundary
        )
        .map((item) => item.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      const effectiveDate = line.items
        .filter(
          (item) => item.x >= validDateBoundary
        )
        .map((item) => item.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (!course) {
        continue;
      }

      savePendingRow();

      pendingRow = {
        college: currentCollege,
        course,
        effectiveDate,
      };
    }

    savePendingRow();
  }

  return rows;
}

  return (
    <div className="import-controls">
      <div className="import-controls-buttons">
        <ImportTranscriptButton
          disabled={!collegeSelected || isProcessing}
        />

        <ImportPlannerButton
          onFileSelected={handlePlannerFileSelected}
        />
      </div>

      {isProcessing && (
        <p className="import-controls-status">
          Reading planner PDF...
        </p>
      )}

      {error && (
				<p
					className={`import-controls-message import-controls-error ${
						messageVisible ? "visible" : ""
					}`}
					role="alert"
				>
					{error}
				</p>
			)}

			{success && (
				<p
					className={`import-controls-message import-controls-success ${
						messageVisible ? "visible" : ""
					}`}
					role="status"
				>
					{success}
				</p>
			)}
    </div>
  );
}