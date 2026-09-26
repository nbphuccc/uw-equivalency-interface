import { useEffect, useState } from "react";
import ImportPlannerButton from "./ImportPlannerButton";
import ImportTranscriptButton from "./ImportTranscriptButton";
import "./ImportControls.css";
import type { Equivalency } from "../types/type";

type Props = {
  collegeSelected: boolean;
  planner: Equivalency[];
  onPlannerImported: (courses: Equivalency[]) => void;
};

export default function ImportControls({
  collegeSelected,
  planner,
  onPlannerImported,
}: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!error && !success) {
      return;
    }

    const removeTimer = window.setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 5000);

    return () => {
      window.clearTimeout(removeTimer);
    };
  }, [error, success]);

  return (
    <div className="import-controls">
      <div className="import-controls-buttons">
        <ImportTranscriptButton
          disabled={!collegeSelected || isProcessing}
        />

        <ImportPlannerButton
          disabled={!collegeSelected || isProcessing}
          planner={planner}
          onPlannerImported={onPlannerImported}
          onProcessingChange={setIsProcessing}
          onError={setError}
          onSuccess={setSuccess}
        />
      </div>

      {isProcessing && (
        <p className="import-controls-status">
          Reading planner PDF...
        </p>
      )}

      {error && (
        <p
          className="import-controls-message import-controls-error"
          role="alert"
        >
          {error}
        </p>
      )}

      {success && (
        <p
          className="import-controls-message import-controls-success"
          role="status"
        >
          {success}
        </p>
      )}
    </div>
  );
}