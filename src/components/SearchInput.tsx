// SearchInput.tsx
type Props = {
  query: string;
  onChange: (value: string) => void;
  onSearchCc: (showActiveOnly: boolean) => void;
  onSearchUw: (showActiveOnly: boolean) => void;
  showActiveOnly: boolean;
};

export default function SearchInput({ query, onChange, onSearchCc, onSearchUw, showActiveOnly }: Props) {
  return (
    <div style={{ marginBottom: 16 }}>
      <input
        type="text"
        placeholder="Enter course name..."
        value={query}
        onChange={(e) => onChange(e.target.value)}
        style={{ marginRight: 8 }}
      />
      <button onClick={() => onSearchCc(showActiveOnly)}>
        Search CC Course
      </button>

      <button
        onClick={() => onSearchUw(showActiveOnly)}
        style={{ marginLeft: 8 }}
      >
        Search UW Course
      </button>
    </div>
  );
}