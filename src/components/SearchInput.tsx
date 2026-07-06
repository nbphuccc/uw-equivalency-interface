// SearchInput.tsx
type Props = {
  query: string;
  onChange: (value: string) => void;
  onSearchCc: (course: string, showActiveOnly: boolean) => void;
  onSearchUw: (course: string, showActiveOnly: boolean) => void;
  showActiveOnly: boolean;
};

export default function SearchInput({ query, onChange, onSearchCc, onSearchUw, showActiveOnly }: Props) {
  return (
    <div style={{ marginBottom: 16 }}>
      <input
        type="text"
        placeholder="Enter course name..."
        value={query}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        style={{ marginRight: 8 }}
      />
      <button onClick={() => onSearchCc(query, showActiveOnly)}>
        Search CC Course
      </button>

      <button
        onClick={() => onSearchUw(query, showActiveOnly)}
        style={{ marginLeft: 8 }}
      >
        Search UW Course
      </button>
    </div>
  );
}