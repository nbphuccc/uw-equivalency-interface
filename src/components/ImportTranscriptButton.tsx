import "./ImportTranscriptButton.css";

type Props = {
  disabled: boolean;
};

export default function ImportTranscriptButton({
  disabled,
}: Props) {

  return (
    <button
      type="button"
      className="import-transcript-button"
      disabled={disabled}
    >
      Import Transcript
    </button>
  );
}