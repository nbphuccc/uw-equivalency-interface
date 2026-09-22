import {
  getDocument,
  GlobalWorkerOptions,
  type PDFDocumentProxy,
} from "pdfjs-dist";

import pdfWorker from
  "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorker;

const MAX_PDF_SIZE = 10 * 1024 * 1024;

export async function loadPdfFile(
  file: File
): Promise<PDFDocumentProxy> {
  const isPdf =
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    throw new Error("Choose a PDF file.");
  }

  if (file.size > MAX_PDF_SIZE) {
    throw new Error(
      "The PDF must be 10 MB or smaller."
    );
  }

  const bytes = await file.arrayBuffer();

  return getDocument({
    data: bytes,
  }).promise;
}