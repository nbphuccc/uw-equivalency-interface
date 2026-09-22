import "./PlannerExporter.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Equivalency } from "../types/type";
import { groupByCommunityCollege } from "../utils/groupBy";

type Props = {
  planner: Equivalency[];
};

export default function PlannerExporter({ planner }: Props) {
  const handleExport = () => {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "letter",
  });

  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("UW Transfer Planner", 14, 15);

  const groupedByCollege = groupByCommunityCollege(planner);

  let currentY = 25;
  const pageHeight = pdf.internal.pageSize.getHeight();

  Object.entries(groupedByCollege).forEach(
    ([collegeName, rows]) => {
      // Prevent the subheader from appearing alone near page bottom.
      if (currentY > pageHeight - 35) {
        pdf.addPage();
        currentY = 15;
      }

      // College subheader
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.text(collegeName, 14, currentY);

      autoTable(pdf, {
        startY: currentY + 4,

        head: [[
          "Course",
          "UW Equivalent",
          "UW Req",
          "Effective Date",
        ]],

        body: rows.map((row) => [
          row.community_college_course,
          row.uw_equivalent,
          row.uw_req,
          row.effective_date,
        ]),

        columnStyles: {
          0: { cellWidth: 95 },
          1: { cellWidth: 95 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 },
        },

        headStyles: {
          fillColor: [75, 46, 131],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },

        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },

        styles: {
          fontSize: 9,
          cellPadding: 3,
        },

        margin: {
          left: 14,
          right: 14,
        },
      });

      const tableResult = pdf as typeof pdf & {
        lastAutoTable: {
          finalY: number;
        };
      };

      currentY = tableResult.lastAutoTable.finalY + 10;
    }
  );

  /*
  * Store only the visible fields needed to query and
  * validate each course during import.
  */
  const metadata = {
    courses: planner.map((row) => ({
      college: row.college_name,
      course: row.community_college_course,
      effectiveDate: row.effective_date,
    })),
  };

  /*
    * Encoding prevents characters such as &, <, or Unicode
    * course text from interfering with the XMP metadata XML.
    */
  pdf.addMetadata(
    encodeURIComponent(JSON.stringify(metadata))
  );

  pdf.save("planner.pdf");
};

  return (
    <button
      type="button"
      className="export-planner-button"
      disabled={planner.length === 0}
      onClick={handleExport}
    >
      Export to PDF
    </button>
  );
}