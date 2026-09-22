import { useRef, useState, type ChangeEvent } from "react";
import "./ImportPlannerButton.css";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

type Props = {
  onFileSelected: (file: File) => void;
};

export default function ImportPlannerButton({ onFileSelected }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function openFilePicker(): void {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const input = event.target;
    const file = input.files?.[0];

    // Allow the same file to be selected again later.
    input.value = "";

    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setError("Choose a PDF file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("The PDF must be 10 MB or smaller.");
      return;
    }

    setError(null);
    onFileSelected(file);
  }

  return (
    <div className="import-planner-control">
      <button
        type="button"
        className="import-planner-button"
        onClick={openFilePicker}
      >
        Import Planner
      </button>

      <input
        ref={fileInputRef}
        className="import-planner-input"
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleFileChange}
      />

      {error && (
        <span className="import-planner-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
